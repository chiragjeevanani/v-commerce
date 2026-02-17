import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../Models/OrderModel.js";
import CJToken from "../Models/CJTokenModel.js";
import ContentModel from "../Models/ContentModel.js";

// Initialize Razorpay
// Note: These should be in .env or stored in DB
// RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET

const getRazorpayInstance = async (checkEnabled = true) => {
    // Try to get from DB first, fallback to env
    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isEnabled = true; // Default to enabled if using env vars
    
    try {
        const settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
        if (settings && settings.content) {
            keyId = settings.content.keyId || keyId;
            keySecret = settings.content.keySecret || keySecret;
            isEnabled = settings.content.isEnabled !== undefined ? settings.content.isEnabled : true;
        }
    } catch (error) {
        console.error("Error loading Razorpay settings from DB:", error);
    }
    
    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials not configured");
    }
    
    // Check if Razorpay is enabled (skip check for admin operations like test connection)
    if (checkEnabled && isEnabled === false) {
        throw new Error("Razorpay payment gateway is currently disabled");
    }
    
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

/**
 * Create a new Razorpay Order
 */
/**
 * Get Razorpay Public Key (Key ID only - safe to expose to frontend)
 */
export const getRazorpayPublicKey = async (req, res) => {
    try {
        const settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
        
        let keyId = null;
        let isEnabled = true;
        
        if (settings && settings.content && settings.content.keyId) {
            keyId = settings.content.keyId.trim();
            isEnabled = settings.content.isEnabled !== undefined ? settings.content.isEnabled : true;
        } else {
            // Fallback to env if DB doesn't have it
            keyId = process.env.RAZORPAY_KEY_ID?.trim();
        }
        
        if (!keyId) {
            return res.status(404).json({
                success: false,
                message: "Razorpay not configured. Please configure Razorpay credentials in admin settings."
            });
        }
        
        // Validate key format (should start with rzp_test_ or rzp_live_)
        if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
            console.warn(`[Razorpay] Invalid key_id format: ${keyId}`);
        }
        
        res.json({
            success: true,
            keyId: keyId,
            isEnabled: isEnabled
        });
    } catch (error) {
        console.error("Get Razorpay Public Key Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Razorpay Settings
 */
export const getRazorpaySettings = async (req, res) => {
    try {
        const settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
        
        if (!settings || !settings.content) {
            return res.json({
                success: true,
                data: {
                    keyId: "",
                    keySecret: "",
                    isConfigured: false,
                    isEnabled: false
                }
            });
        }
        
        // Mask the secret key for security
        const maskedSecret = settings.content.keySecret 
            ? "•".repeat(Math.min(settings.content.keySecret.length, 20))
            : "";
        
        res.json({
            success: true,
            data: {
                keyId: settings.content.keyId || "",
                keySecret: maskedSecret,
                isConfigured: !!(settings.content.keyId && settings.content.keySecret),
                isEnabled: settings.content.isEnabled !== undefined ? settings.content.isEnabled : false,
                lastUpdated: settings.updatedAt
            }
        });
    } catch (error) {
        console.error("Get Razorpay Settings Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Razorpay Settings
 */
export const updateRazorpaySettings = async (req, res) => {
    try {
        const { keyId, keySecret, isEnabled } = req.body;
        
        // Allow updating isEnabled without credentials if just toggling
        if (isEnabled !== undefined && (!keyId || !keySecret)) {
            // Just updating enabled status - get existing settings
            let settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
            if (!settings || !settings.content || !settings.content.keyId || !settings.content.keySecret) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Please configure credentials before enabling Razorpay" 
                });
            }
            
            settings.content.isEnabled = isEnabled;
            settings.markModified('content');
            await settings.save();
            
            return res.json({
                success: true,
                message: `Razorpay ${isEnabled ? 'enabled' : 'disabled'} successfully`,
                data: {
                    keyId: settings.content.keyId,
                    keySecret: "•".repeat(20),
                    isConfigured: true,
                    isEnabled: isEnabled,
                    lastUpdated: settings.updatedAt
                }
            });
        }
        
        if (!keyId || !keySecret) {
            return res.status(400).json({ 
                success: false, 
                message: "Both Key ID and Key Secret are required" 
            });
        }
        
        // Validate Razorpay credentials by trying to create an instance
        try {
            const testInstance = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });
            // Test by fetching orders list (simpler than accounts.fetch which may require different permissions)
            await testInstance.orders.all({ count: 1 });
        } catch (testError) {
            console.error("Razorpay validation error:", testError);
            return res.status(400).json({
                success: false,
                message: testError.message || "Invalid Razorpay credentials. Please check your Key ID and Key Secret."
            });
        }
        
        // Save to DB
        let settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
        
        if (!settings) {
            settings = new ContentModel({
                contentType: 'razorpay_settings',
                content: {}
            });
        }
        
        settings.content = {
            keyId: keyId.trim(),
            keySecret: keySecret.trim(),
            isEnabled: isEnabled !== undefined ? isEnabled : (settings.content.isEnabled !== undefined ? settings.content.isEnabled : false)
        };
        settings.markModified('content');
        await settings.save();
        
        res.json({
            success: true,
            message: "Razorpay settings updated successfully",
            data: {
                keyId: settings.content.keyId,
                keySecret: "•".repeat(20), // Masked
                isConfigured: true,
                isEnabled: settings.content.isEnabled,
                lastUpdated: settings.updatedAt
            }
        });
    } catch (error) {
        console.error("Update Razorpay Settings Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Test Razorpay Connection
 */
export const testRazorpayConnection = async (req, res) => {
    try {
        // Don't check enabled status for test connection (admin operation)
        const razorpay = await getRazorpayInstance(false);
        // Test by fetching orders list (simpler than accounts.fetch)
        const orders = await razorpay.orders.all({ count: 1 });
        
        res.json({
            success: true,
            message: "Razorpay connection successful",
            data: {
                connected: true,
                ordersCount: orders?.items?.length || 0
            }
        });
    } catch (error) {
        console.error("Test Razorpay Connection Error:", error);
        res.status(400).json({ 
            success: false, 
            message: error.message || "Failed to connect to Razorpay. Please check your credentials." 
        });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
        }

        const razorpay = await getRazorpayInstance();

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        console.log(`[Razorpay] Creating order with amount: ${options.amount} ${options.currency}`);

        const order = await razorpay.orders.create(options);

        console.log(`[Razorpay] Order created successfully: ${order.id}`);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        const errorMessage = error.message || "Failed to create Razorpay order";
        
        // Provide more helpful error messages
        if (errorMessage.includes("id provided does not exist")) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Razorpay credentials. Please check your Key ID and Key Secret in admin settings." 
            });
        }
        
        res.status(500).json({ success: false, message: errorMessage });
    }
};

/**
 * Verify Razorpay Payment and Confirm Order
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData // Internal order data to save after verification
        } = req.body;

        // Get the secret key from DB or env
        let keySecret = process.env.RAZORPAY_KEY_SECRET;
        try {
            const settings = await ContentModel.findOne({ contentType: 'razorpay_settings' });
            if (settings && settings.content && settings.content.keySecret) {
                keySecret = settings.content.keySecret;
            }
        } catch (error) {
            console.error("Error loading Razorpay secret from DB:", error);
        }
        
        if (!keySecret) {
            return res.status(500).json({ success: false, message: "Razorpay credentials not configured" });
        }
        
        // Verify signature
        const hmac = crypto.createHmac("sha256", keySecret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Payment verified! Now create the order in our DB and sync with CJ
        // We can reuse parts of OrderController.placeOrder logic here

        const { items, total, shipping } = orderData;

        // 1. Save order internally
        const newOrder = await Order.create({
            user: req.user._id,
            items,
            totalAmount: total,
            shippingAddress: {
                fullName: shipping.fullName,
                street: shipping.street,
                city: shipping.city,
                state: shipping.state,
                country: shipping.country || "India",
                zipCode: shipping.zipCode,
                phoneNumber: shipping.phoneNumber
            },
            paymentMethod: "online",
            paymentStatus: "paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        // 2. Sync with CJ Dropshipping (Async is fine, but we'll wait for confirmation display)
        try {
            const cjTokenData = await CJToken.findOne({});
            const accessToken = cjTokenData?.accessToken;

            if (accessToken) {
                // Simplified CJ order creation (reusing logic from OrderController)
                const cjProducts = await Promise.all(items.map(async (item) => {
                    return {
                        vid: item.vid || item.pid, // Assuming vid is passed or pid fallback
                        quantity: item.quantity,
                        storeLineItemId: item.pid
                    };
                }));

                const cjOrderData = {
                    orderNumber: newOrder._id.toString(),
                    shippingZip: shipping.zipCode,
                    shippingCountryCode: "IN",
                    shippingCountry: shipping.country || "India",
                    shippingProvince: shipping.state,
                    shippingCity: shipping.city,
                    shippingPhone: shipping.phoneNumber,
                    shippingCustomerName: shipping.fullName,
                    shippingAddress: shipping.street,
                    platform: "v-commerce",
                    fromCountryCode: "CN",
                    logisticName: "CJPacket Sensitive",
                    shopLogisticsType: 2,
                    storageId: "201e67f6ba4644c0a36d63bf4989dd70",
                    products: cjProducts
                };

                const cjResponse = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
                    method: 'POST',
                    headers: {
                        'CJ-Access-Token': accessToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cjOrderData)
                });

                const cjResult = await cjResponse.json();
                if (cjResult.success) {
                    newOrder.cjOrderId = cjResult.data?.[0]?.cjOrderId;
                    newOrder.status = "confirmed";
                    await newOrder.save();
                }
            }
        } catch (cjErr) {
            console.error("CJ Sync Error during payment verification:", cjErr);
        }

        res.json({
            success: true,
            message: "Payment verified and order placed",
            orderId: newOrder._id,
            orderData: newOrder
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
