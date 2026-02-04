import asyncHandler from "express-async-handler";
import Order from "../Models/OrderModel.js";
import User from "../Models/AuthModel.js";
import CJToken from "../Models/CJTokenModel.js";

/**
 * Place a new order
 * Internal order creation + CJ Dropshipping order creation
 */
export const placeOrder = asyncHandler(async (req, res) => {
    const { items, total, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "No items in order" });
    }

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
        paymentMethod: paymentMethod || "card"
    });

    // 2. Prepare CJ Dropshipping order data
    // Note: In a real app, you'd need the CJ 'vid' (Variant ID) for each product. 
    // We'll assume the 'pid' or 'sku' we have can be mapped or used.
    // In the frontend, we stored pid/sku.

    try {
        const cjTokenData = await CJToken.findOne({});
        const accessToken = cjTokenData?.accessToken;
        const platformToken = process.env.CJ_PLATFORM_TOKEN; // Should be in .env

        if (accessToken) {
            // Helper to get VID for a PID
            const getVidForPid = async (pid) => {
                try {
                    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/variant/query?pid=${pid}`, {
                        headers: { 'CJ-Access-Token': accessToken }
                    });
                    const result = await response.json();
                    if (result.success && result.data && result.data.length > 0) {
                        return result.data[0].vid;
                    }
                } catch (e) {
                    console.error("Error fetching variant for PID:", pid, e);
                }
                return pid; // Fallback
            };

            const cjProducts = await Promise.all(items.map(async (item) => {
                const vid = item.vid || await getVidForPid(item.pid);
                return {
                    vid: vid,
                    quantity: item.quantity,
                    storeLineItemId: item.pid
                };
            }));

            const cjOrderData = {
                orderNumber: newOrder._id.toString(),
                shippingZip: shipping.zipCode,
                shippingCountryCode: "IN", // Assuming India for now
                shippingCountry: shipping.country || "India",
                shippingProvince: shipping.state,
                shippingCity: shipping.city,
                shippingPhone: shipping.phoneNumber,
                shippingCustomerName: shipping.fullName,
                shippingAddress: shipping.street,
                platform: "shopify",
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
                newOrder.cjResponse = cjResult;
                newOrder.status = "confirmed";
                await newOrder.save();
            } else {
                console.error("CJ Order Creation Failed:", cjResult);
                newOrder.cjResponse = cjResult;
                await newOrder.save();
            }
        }
    } catch (error) {
        console.error("Error calling CJ API:", error);
    }

    res.status(201).json({
        success: true,
        orderId: newOrder._id,
        orderData: newOrder
    });
});

/**
 * Get current user's orders
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: orders.map(order => ({
            id: order._id, // BUG FIX 1: Map _id to id
            total: order.totalAmount, // BUG FIX 2: Map totalAmount to total
            ...order.toObject()
        }))
    });
});

/**
 * Get order details
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Add a default timeline if it doesn't exist
    const orderData = order.toObject();

    // BUG FIXES: Map fields for frontend consistency
    orderData.id = order._id; // BUG FIX 1
    orderData.total = order.totalAmount; // BUG FIX 2

    orderData.timeline = [
        { status: "placed", label: "Order Placed", date: order.createdAt, completed: true },
        { status: "confirmed", label: "Confirmed", date: order.status !== 'placed' ? order.updatedAt : null, completed: order.status !== 'placed' },
        { status: "shipped", label: "Shipped", date: null, completed: ['shipped', 'delivered'].includes(order.status) },
        { status: "delivered", label: "Delivered", date: null, completed: order.status === 'delivered' }
    ];

    res.json({
        success: true,
        data: orderData
    });
});

// ================= ADMIN CONTROLLERS =================

/**
 * Get all orders (Admin)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNum) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    const count = await Order.countDocuments({});

    const orders = await Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        success: true,
        data: {
            orders: orders.map(order => ({
                id: order._id, // Mapping _id to id for frontend consistency
                ...order.toObject()
            })),
            total: count,
            page,
            totalPages: Math.ceil(count / pageSize)
        }
    });
});

/**
 * Get order details (Admin)
 */
export const getAdminOrderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Add timeline if not exists in DB (simulate standard timeline)
    const orderData = order.toObject();
    orderData.id = order._id; // Ensure ID availability
    orderData.timeline = [
        { status: "placed", label: "Order Placed", date: order.createdAt, completed: true },
        { status: "confirmed", label: "Confirmed", date: order.status !== 'placed' ? order.updatedAt : null, completed: order.status !== 'placed' },
        { status: "shipped", label: "Shipped", date: null, completed: ['shipped', 'delivered'].includes(order.status) },
        { status: "delivered", label: "Delivered", date: null, completed: order.status === 'delivered' }
    ];

    res.json({
        success: true,
        data: orderData
    });
});

/**
 * Get orders by user ID (Admin)
 */
export const getOrdersByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: orders.map(order => ({
            id: order._id, // Frontend consistency
            ...order.toObject()
        }))
    });
});

/**
 * Get recent orders (Admin - Top 5)
 */
export const getRecentOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email");

    res.json({
        success: true,
        data: orders.map(order => ({
            id: order._id,
            total: order.totalAmount,
            status: order.status,
            date: order.createdAt,
            user: order.user,
            ...order.toObject()
        }))
    });
});
