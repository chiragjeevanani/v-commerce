import CJToken from "../Models/CJTokenModel.js";

/**
 * Fetches and updates the CJ Access Token from the CJ API
 */
export const getCJAccessToken = async (req, res) => {
    try {
        const apiKey = process.env.CJ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "CJ_API_KEY is not defined in environment variables",
            });
        }

        const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey }),
        });

        const result = await response.json();

        if (result.code === 200 && result.success) {
            const { openId, accessToken, accessTokenExpiryDate, refreshToken, refreshTokenExpiryDate } = result.data;

            // Update or create token in DB. We only store one set of tokens.
            const updatedToken = await CJToken.findOneAndUpdate(
                {},
                {
                    openId,
                    accessToken,
                    accessTokenExpiryDate: new Date(accessTokenExpiryDate),
                    refreshToken,
                    refreshTokenExpiryDate: new Date(refreshTokenExpiryDate),
                },
                { upsert: true, new: true }
            );

            return res.json({
                success: true,
                message: "CJ Access Token synced successfully",
                data: updatedToken,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message || "Failed to fetch CJ Access Token",
                error: result,
            });
        }
    } catch (error) {
        console.error("CJ Get Access Token Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Utility function to get the current valid token from DB
 * Can be used by other CJ API functions
 */
export const getStoredCJToken = async () => {
    try {
        const tokenData = await CJToken.findOne({});
        if (!tokenData) return null;

        // Check if expired
        const now = new Date();
        const expiry = new Date(tokenData.accessTokenExpiryDate);

        // If expired or expiring in less than 5 minutes, consider it invalid
        if (expiry.getTime() <= now.getTime() + 300000) {
            console.log("CJ Token expired or near expiry, needs sync.");
            return null;
        }

        return tokenData.accessToken;
    } catch (error) {
        console.error("Error fetching stored CJ token:", error);
        return null;
    }
};

/**
 * Internal helper to fetch a new token without requiring a request object
 */
const fetchAndSyncCJToken = async () => {
    try {
        const apiKey = process.env.CJ_API_KEY;
        if (!apiKey) throw new Error("CJ_API_KEY missing in .env");

        console.log("Attempting automatic CJ Token sync...");
        const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
        });

        const result = await response.json();
        if (result.code === 200 && result.success) {
            const { openId, accessToken, accessTokenExpiryDate, refreshToken, refreshTokenExpiryDate } = result.data;
            await CJToken.findOneAndUpdate(
                {},
                {
                    openId,
                    accessToken,
                    accessTokenExpiryDate: new Date(accessTokenExpiryDate),
                    refreshToken,
                    refreshTokenExpiryDate: new Date(refreshTokenExpiryDate),
                },
                { upsert: true, new: true }
            );
            console.log("Automatic CJ Token sync successful.");
            return accessToken;
        }
        throw new Error(result.message || "Failed to sync CJ token");
    } catch (error) {
        console.error("Auto Sync Error:", error.message);
        return null;
    }
};

/**
 * GET endpoint to view current token status (for testing/admin)
 */
export const getCJTokenStatus = async (req, res) => {
    try {
        const tokenData = await CJToken.findOne({});
        if (!tokenData) {
            return res.status(404).json({
                success: false,
                message: "No CJ token found in database",
            });
        }

        res.json({
            success: true,
            message: "CJ token status fetched",
            data: {
                openId: tokenData.openId,
                accessTokenExpiryDate: tokenData.accessTokenExpiryDate,
                refreshTokenExpiryDate: tokenData.refreshTokenExpiryDate,
                isExpired: new Date() > new Date(tokenData.accessTokenExpiryDate),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * Helper to make a request to CJ API with stored token
 */
const makeCJRequest = async (endpoint, method = 'GET', queryParams = {}, body = null, extraHeaders = {}) => {
    let accessToken = await getStoredCJToken();

    // AUTO-HEALING: If token is missing, try to sync it automatically once
    if (!accessToken) {
        accessToken = await fetchAndSyncCJToken();
    }

    if (!accessToken) {
        throw new Error("CJ Access Token missing or expired. Automatic sync failed. Please check your CJ_API_KEY in .env");
    }

    let url = `https://developers.cjdropshipping.com/api2.0/v1${endpoint}`;

    // Add query params if any
    const params = new URLSearchParams(queryParams).toString();
    if (params) {
        url += `?${params}`;
    }

    const headers = {
        'CJ-Access-Token': accessToken,
        ...extraHeaders
    };

    let fetchBody = body;
    if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        fetchBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
        method,
        headers,
        body: fetchBody
    });

    return await response.json();
};

// ================= PRODUCT APIS =================

// Simple in-memory cache for categories to avoid QPS limits
let categoryCache = null;
let categoryCacheTime = 0;
const CATEGORY_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Get Product Categories
 */
export const getCategories = async (req, res) => {
    try {
        const now = Date.now();
        if (categoryCache && (now - categoryCacheTime < CATEGORY_CACHE_DURATION)) {
            console.log("Serving categories from cache...");
            return res.json(categoryCache);
        }

        const result = await makeCJRequest('/product/getCategory');

        // Only cache if successful
        if (result && result.success && result.code === 200) {
            categoryCache = result;
            categoryCacheTime = now;
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * List Products (v2)
 */
export const listProductsV2 = async (req, res) => {
    try {
        const { page = 1, size = 20, keyWord, categoryId, pid, productName, status } = req.query;

        // Construct query object for CJ API
        const query = {
            pageNum: page,
            pageSize: size
        };

        if (keyWord) query.keyWord = keyWord;
        if (categoryId) query.categoryId = categoryId;
        if (pid) query.pid = pid;
        if (productName) query.productName = productName;
        if (status) query.status = status;

        const result = await makeCJRequest('/product/listV2', 'GET', query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Global Warehouse List
 */
export const getGlobalWarehouseList = async (req, res) => {
    try {
        const result = await makeCJRequest('/product/globalWarehouseList');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * List Products
 */
export const listProducts = async (req, res) => {
    try {
        const result = await makeCJRequest('/product/list');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Product Details (Query by pid)
 */
export const getProductDetails = async (req, res) => {
    try {
        const { pid } = req.query;
        if (!pid) {
            return res.status(400).json({ success: false, message: "pid is required" });
        }
        const result = await makeCJRequest('/product/query', 'GET', { pid });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Product Variants (Query by pid)
 */
export const getProductVariants = async (req, res) => {
    try {
        const { pid } = req.query;
        if (!pid) {
            return res.status(400).json({ success: false, message: "pid is required" });
        }
        const result = await makeCJRequest('/product/variant/query', 'GET', { pid });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Variant by Vid
 */
export const getVariantByVid = async (req, res) => {
    try {
        const { vid } = req.query;
        if (!vid) {
            return res.status(400).json({ success: false, message: "vid is required" });
        }
        const result = await makeCJRequest('/product/variant/queryByVid', 'GET', { vid });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= INVENTORY APIS =================

/**
 * Get Inventory by Vid
 */
export const getInventoryByVid = async (req, res) => {
    try {
        const { vid } = req.query;
        if (!vid) {
            return res.status(400).json({ success: false, message: "vid is required" });
        }
        const result = await makeCJRequest('/product/stock/queryByVid', 'GET', { vid });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Inventory by SKU
 */
export const getInventoryBySku = async (req, res) => {
    try {
        const { sku } = req.query;
        if (!sku) {
            return res.status(400).json({ success: false, message: "sku is required" });
        }
        const result = await makeCJRequest('/product/stock/queryBySku', 'GET', { sku });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Inventory by Pid
 */
export const getInventoryByPid = async (req, res) => {
    try {
        const { pid } = req.query;
        if (!pid) {
            return res.status(400).json({ success: false, message: "pid is required" });
        }
        const result = await makeCJRequest('/product/stock/getInventoryByPid', 'GET', { pid });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= SHOPPING ORDER FLOW APIS =================

/**
 * Create Order V2
 */
export const createOrderV2 = async (req, res) => {
    try {
        const platformToken = req.headers['platformtoken'];
        const result = await makeCJRequest(
            '/shopping/order/createOrderV2',
            'POST',
            {},
            req.body,
            platformToken ? { platformToken } : {}
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Order V3
 */
export const createOrderV3 = async (req, res) => {
    try {
        const platformToken = req.headers['platformtoken'];
        const result = await makeCJRequest(
            '/shopping/order/createOrderV3',
            'POST',
            {},
            req.body,
            platformToken ? { platformToken } : {}
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add to Cart
 */
export const addCart = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/order/addCart', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Confirm Cart
 */
export const addCartConfirm = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/order/addCartConfirm', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Save and Generate Parent Order
 */
export const saveGenerateParentOrder = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/order/saveGenerateParentOrder', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ORDER MANAGEMENT APIS =================

/**
 * Get Order List
 */
export const getOrderList = async (req, res) => {
    try {
        const { pageNum = 1, pageSize = 10 } = req.query;
        const result = await makeCJRequest('/shopping/order/list', 'GET', { pageNum, pageSize });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Order Detail
 */
export const getOrderDetail = async (req, res) => {
    try {
        const { orderId, features } = req.query;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }
        // If features is an array, URLSearchParams handles it. If single string, it also works.
        const result = await makeCJRequest('/shopping/order/getOrderDetail', 'GET', { orderId, features });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Order
 */
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }
        const result = await makeCJRequest('/shopping/order/deleteOrder', 'DELETE', { orderId });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Confirm Order
 */
export const confirmOrder = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/order/confirmOrder', 'PATCH', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Change Order Warehouse
 */
export const changeOrderWarehouse = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/order/changeWarehouse', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= PAYMENT APIS =================

/**
 * Get Wallet Balance
 */
export const getWalletBalance = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/pay/getBalance', 'GET');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Pay Balance
 */
export const payBalance = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/pay/payBalance', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Pay Balance V2
 */
export const payBalanceV2 = async (req, res) => {
    try {
        const result = await makeCJRequest('/shopping/pay/payBalanceV2', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= WAYBILL / SHIPPING APIS =================

/**
 * Upload Waybill Info (Multipart/Form-Data)
 */
export const uploadWaybillInfo = async (req, res) => {
    try {
        const { orderId, cjOrderId, cjShippingCompanyName, trackNumber } = req.body;

        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('cjOrderId', cjOrderId);
        formData.append('cjShippingCompanyName', cjShippingCompanyName);
        formData.append('trackNumber', trackNumber);

        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            formData.append('waybillFile', blob, req.file.originalname);
        }

        const result = await makeCJRequest('/shopping/order/uploadWaybillInfo', 'POST', {}, formData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Waybill Info (Multipart/Form-Data)
 */
export const updateWaybillInfo = async (req, res) => {
    try {
        const { orderId, cjOrderId, cjShippingCompanyName, trackNumber } = req.body;

        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('cjOrderId', cjOrderId);
        formData.append('cjShippingCompanyName', cjShippingCompanyName);
        formData.append('trackNumber', trackNumber);

        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            formData.append('waybillFile', blob, req.file.originalname);
        }

        const result = await makeCJRequest('/shopping/order/updateWaybillInfo', 'POST', {}, formData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= LOGISTICS & TRACKING APIS =================

/**
 * Freight Calculate
 */
export const calculateFreight = async (req, res) => {
    try {
        const result = await makeCJRequest('/logistic/freightCalculate', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Freight Calculate Tip
 */
export const calculateFreightTip = async (req, res) => {
    try {
        const result = await makeCJRequest('/logistic/freightCalculateTip', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Supplier Logistics Template
 */
export const getSupplierLogisticsTemplate = async (req, res) => {
    try {
        const result = await makeCJRequest('/logistic/getSupplierLogisticsTemplate', 'POST', {}, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Track Info (v1)
 */
export const getTrackInfo = async (req, res) => {
    try {
        const { trackNumber } = req.query;
        // Handling multiple trackNumber params if passed as array or single string
        const result = await makeCJRequest('/logistic/getTrackInfo', 'GET', { trackNumber });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Track Info (v2)
 */
export const trackInfo = async (req, res) => {
    try {
        const { trackNumber } = req.query;
        const result = await makeCJRequest('/logistic/trackInfo', 'GET', { trackNumber });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * Estimate Shipping and Delivery Time
 */
export const estimateShipping = async (req, res) => {
    try {
        const { pid, quantity = 1, countryCode = 'IN' } = req.body;

        if (!pid) {
            return res.status(400).json({ success: false, message: "pid is required" });
        }

        // 1. Get Variants to find a valid vid
        const variantResponse = await makeCJRequest('/product/variant/query', 'GET', { pid });

        let vid = null;
        let variantSku = null;

        if (variantResponse.success && variantResponse.data && variantResponse.data.length > 0) {
            // Find the first variant that has a different vid from pid if possible, 
            // or just take the first one.
            const bestVariant = variantResponse.data.find(v => v.vid !== pid) || variantResponse.data[0];
            vid = bestVariant.vid;
            variantSku = bestVariant.variantSku;
        }

        // 2. Prepare Freight Calculation Request
        // Ensure we send valid payload structure for CJ
        const freightRequest = {
            startCountryCode: 'CN', // Default to China
            endCountryCode: countryCode,
            products: [{
                quantity: quantity,
                // CJ API prefers vid over sku for accuracy, but sku works if vid is missing
                ...(vid ? { vid } : { sku: variantSku })
            }]
        };

        const result = await makeCJRequest('/logistic/freightCalculate', 'POST', {}, freightRequest);

        // If it still fails, try with just SKU if available
        if (!result.success && variantSku) {
            const retryRequest = {
                startCountryCode: 'CN',
                endCountryCode: countryCode,
                products: [{
                    sku: variantSku,
                    quantity: quantity
                }]
            };
            const retryResult = await makeCJRequest('/logistic/freightCalculate', 'POST', {}, retryRequest);
            return handleFreightResult(retryResult, res);
        }

        return handleFreightResult(result, res);

    } catch (error) {
        console.error("Estimate Shipping Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper to process CJ freight results
 */
const handleFreightResult = (result, res) => {
    if (result.success && result.data) {
        const methods = result.data.map(method => ({
            name: method.logisticName,
            fee: Math.round(parseFloat(method.freight) * 83), // USD to INR
            time: method.aging,
            id: method.id || method.logisticName
        }));

        return res.json({
            success: true,
            data: methods
        });
    }
    return res.json(result);
};
