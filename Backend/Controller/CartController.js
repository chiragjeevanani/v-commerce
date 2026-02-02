import asyncHandler from "express-async-handler";
import Cart from "../Models/CartModel.js";

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart or update quantity
// @route   POST /api/v1/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { pid, name, image, price, quantity, category, sku } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            userId: req.user._id,
            items: [{ pid, name, image, price, quantity: quantity || 1, category, sku }]
        });
    } else {
        const itemIndex = cart.items.findIndex(item => item.pid === pid);

        if (itemIndex > -1) {
            // Item exists, update quantity
            cart.items[itemIndex].quantity += (quantity || 1);
        } else {
            // New item
            cart.items.push({ pid, name, image, price, quantity: quantity || 1, category, sku });
        }
        await cart.save();
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/update
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const { pid, quantity } = req.body;

    if (quantity < 1) {
        return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item.pid === pid);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({ success: true, data: cart });
    } else {
        res.status(404).json({ success: false, message: "Item not found in cart" });
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/remove/:pid
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const { pid } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.pid !== pid);
    await cart.save();

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
        success: true,
        message: "Cart cleared"
    });
});

// @desc    Sync local cart with backend (optional but good for guest to logged-in transition)
// @route   POST /api/v1/cart/sync
// @access  Private
export const syncCart = asyncHandler(async (req, res) => {
    const { items } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items });
    } else {
        // Simple merge logic: if item exists in remote, take max quantity or remote quantity
        // For simplicity, let's just append new items or update count
        items.forEach(localItem => {
            const index = cart.items.findIndex(remoteItem => remoteItem.pid === localItem.pid);
            if (index > -1) {
                cart.items[index].quantity = Math.max(cart.items[index].quantity, localItem.quantity);
            } else {
                cart.items.push(localItem);
            }
        });
        await cart.save();
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});
