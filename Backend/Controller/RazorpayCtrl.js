import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../Models/OrderModel.js";
import CJToken from "../Models/CJTokenModel.js";

// Initialize Razorpay
// Note: These should be in .env
// RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/**
 * Create a new Razorpay Order
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        const razorpay = getRazorpayInstance();

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
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

        // Verify signature
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
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
