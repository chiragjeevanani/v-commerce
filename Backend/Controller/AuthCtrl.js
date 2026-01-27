import User from "../Models/AuthModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../Helpers/generateToken.js";
import { sendOTPEmail } from "../Helpers/SendMail.js";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email, isDeleted: false });
    if (userExists)
      return res.status(400).json({
        success: false,
        message: "User already exists",
        data: null,
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials", data: null });
    if (!user.isActive )
      return res.status(403).json({ success: false, message: "Account deactivated", data: null });
    if (user.isDeleted)
      return res.status(403).json({ success: false, message: "Account deleted", data: null });
    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "Account not verified", data: null });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials", data: null });

    res.json({
      success: true,
      message: "Login successful",
      data: user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= VERIFY USER =================
export const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required", data: null });

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP", data: null });

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "User verified successfully",
      data: user,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};


// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Old password incorrect", data: null });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already exists", data: null });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    await user.save();

    res.json({ success: true, message: "Profile updated", data: user, token: generateToken(user._id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= SOFT DELETE =================
export const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isDeleted = true;
    await user.save();

    res.json({ success: true, message: "Account deactivated successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= DELETE PROFILE PERMANENT =================
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.json({ success: true, message: "Account deleted permanently", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= ACTIVE / DEACTIVE USER (ADMIN) =================
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "Activated" : "Deactivated"}`,
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= RESEND OTP =================
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= USER PROFILE =================
export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, message: "User profile fetched", data: user, token: generateToken(user._id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= USER PROFILE BY ID =================
export const userProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, message: "User profile fetched", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match", data: null });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ success: true, message: "Password set successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};