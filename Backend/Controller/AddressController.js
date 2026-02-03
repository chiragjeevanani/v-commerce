import asyncHandler from "express-async-handler";
import User from "../Models/AuthModel.js";

// @desc    Get all addresses for a user
// @route   GET /api/v1/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: user.addresses || []
    });
});

// @desc    Add a new shipping address
// @route   POST /api/v1/addresses/add
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
    const { fullName, addressType, street, city, state, country, zipCode, phoneNumber, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    if (user.addresses.length >= 3) {
        return res.status(400).json({ success: false, message: "You can only add up to 3 addresses. Please delete one to add a new one." });
    }

    // If this is the first address or user set it as default, handle default logic
    if (isDefault || user.addresses.length === 0) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
        fullName,
        addressType: addressType || "Home",
        street,
        city,
        state,
        country: country || "India",
        zipCode,
        phoneNumber,
        isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
        success: true,
        message: "Address added successfully",
        data: user.addresses
    });
});

// @desc    Update an address
// @route   PUT /api/v1/addresses/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

    if (addressIndex === -1) {
        return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Handle default logic if isDefault is being set to true
    if (updates.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update fields
    Object.assign(user.addresses[addressIndex], updates);

    await user.save();

    res.status(200).json({
        success: true,
        message: "Address updated successfully",
        data: user.addresses
    });
});

// @desc    Delete an address
// @route   DELETE /api/v1/addresses/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if we are deleting the default address
    const addressToDelete = user.addresses.find(addr => addr._id.toString() === addressId);
    const wasDefault = addressToDelete?.isDefault;

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    // If we deleted the default and there are other addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Address deleted successfully",
        data: user.addresses
    });
});

// @desc    Set default address
// @route   PUT /api/v1/addresses/set-default/:addressId
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Default address updated",
        data: user.addresses
    });
});
