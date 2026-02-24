import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    category: String,
    sku: String,
    isStoreProduct: { type: Boolean, default: false },
    allowPartialPayment: { type: Boolean, default: false }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
