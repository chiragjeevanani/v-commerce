import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            pid: String,
            name: String,
            image: String,
            price: Number,
            quantity: Number,
            sku: String
        }
    ],
    shippingAddress: {
        fullName: String,
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        phoneNumber: String
    },
    paymentMethod: {
        type: String,
        default: "card"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
        default: "placed"
    },
    cjOrderId: {
        type: String
    },
    cjResponse: {
        type: Object
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
