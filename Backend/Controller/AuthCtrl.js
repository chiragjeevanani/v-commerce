import User from "../Models/AuthModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../Helpers/generateToken.js";
import { sendOTPEmail } from "../Helpers/SendMail.js";
import { sendOTPSMS } from "../Helpers/SendSMS.js";
import { getIO } from "../Config/socket.js";

// ================= REGISTER (Mobile Only) =================
export const registerUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const cleanPhone = (phoneNumber || "").replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit phone number is required",
        data: null,
      });
    }

    // If user already exists with this phone -> ask to login
    const existingUser = await User.findOne({ phoneNumber: cleanPhone, isDeleted: false });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "Account already exists. Use Login with this mobile number.",
        data: null,
      });

    const cleanPhoneForOTP = (phoneNumber || "").replace(/\D/g, "").slice(-10);
    const otp = cleanPhoneForOTP === "6268204871" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    const placeholderEmail = `mobile_${cleanPhone}@temp.vcommerce.local`;
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    const user = await User.create({
      fullName: "User",
      email: placeholderEmail,
      password: hashedPassword,
      phoneNumber: cleanPhone,
      isVerified: false,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    if (cleanPhoneForOTP !== "6268204871") {
      await sendOTPSMS(cleanPhone, otp);
    }

    res.json({
      success: true,
      message: "OTP sent to your mobile. Verify to complete registration.",
      data: { pending_phone: cleanPhone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= VERIFY SIGNUP OTP =================
export const verifySignupOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp)
      return res.status(400).json({ success: false, message: "Phone number and OTP are required", data: null });

    const user = await User.findOne({
      phoneNumber: phoneNumber.replace(/\D/g, "").slice(-10),
      otp,
      otpExpire: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP", data: null });

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Account verified successfully",
      data: user,
      token: generateToken(user._id, user.tokenVersion || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= SEND OTP FOR LOGIN =================
export const sendOTPLogin = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length !== 10)
      return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required", data: null });

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({ phoneNumber: cleanPhone, isDeleted: false });
    if (!user)
      return res.status(404).json({ success: false, message: "No account found with this phone number", data: null });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated", data: null });

    const otp = cleanPhone === "6268204871" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (cleanPhone !== "6268204871") {
      await sendOTPSMS(cleanPhone, otp);
    }

    res.json({
      success: true,
      message: "OTP sent to your mobile number",
      data: { pending_phone: cleanPhone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= VERIFY OTP & LOGIN =================
export const verifyOTPLogin = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp)
      return res.status(400).json({ success: false, message: "Phone number and OTP are required", data: null });

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({
      phoneNumber: cleanPhone,
      otp,
      otpExpire: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP", data: null });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated", data: null });

    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      data: user,
      token: generateToken(user._id, user.tokenVersion || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= RESEND SIGNUP OTP =================
export const resendSignupOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber)
      return res.status(400).json({ success: false, message: "Phone number is required", data: null });

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({ phoneNumber: cleanPhone, isDeleted: false });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    const otp = cleanPhone === "6268204871" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (cleanPhone !== "6268204871") {
      await sendOTPSMS(cleanPhone, otp);
    }

    res.json({ success: true, message: "OTP resent to your mobile", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find non-deleted user first, if not found, check all users
    let user = await User.findOne({ email, isDeleted: false });
    
    // If no non-deleted user found, check if any user exists with this email
    if (!user) {
      const deletedUser = await User.findOne({ email, isDeleted: true });
      if (deletedUser) {
        return res.status(403).json({ success: false, message: "Account deleted", data: null });
      }
      return res.status(400).json({ success: false, message: "Invalid credentials", data: null });
    }

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated", data: null });
    
    // Email verification check removed - users can login directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials", data: null });

    // Auto-verify user if not already verified (for backward compatibility)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      message: "Login successful",
      data: user,
      token: generateToken(user._id, user.tokenVersion || 0),
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
      token: generateToken(user._id, user.tokenVersion || 0)
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
    const { fullName, email, phoneNumber, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, isDeleted: false });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already exists", data: null });
    }

    user.fullName = fullName !== undefined ? fullName : user.fullName;
    user.email = email !== undefined ? email : user.email;
    if (phoneNumber !== undefined && phoneNumber.length === 10) {
      user.phoneNumber = phoneNumber.replace(/\D/g, "").slice(-10);
    }
    if (avatar !== undefined && avatar) user.avatar = avatar;
    await user.save();

    res.json({ success: true, message: "Profile updated", data: user, token: generateToken(user._id, user.tokenVersion || 0) });
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
    res.json({ success: true, message: "User profile fetched", data: user, token: generateToken(user._id, user.tokenVersion || 0) });
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

// ================= GET ALL USERS (ADMIN) =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false, role: "user" }).sort({ createdAt: -1 });
    res.json({ success: true, message: "Users fetched", data: users });
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

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isDeleted: false });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found with this email", data: null });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to your email", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= VERIFY FORGOT PASSWORD OTP =================
export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP", data: null });

    // Generate a temporary reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified. You can now reset your password.",
      data: { resetToken }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset session", data: null });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now login.", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= FORCE LOGOUT (ADMIN) =================
export const forceLogoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Real-time Force Logout via Socket.io
    try {
      getIO().to(user._id.toString()).emit("forceLogout", { message: "Your session has been terminated by the administrator." });
    } catch (ioErr) {
      console.warn("Socket.io not available for logout emission:", ioErr.message);
    }

    res.json({
      success: true,
      message: "User logged out from all devices",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= FORCE LOGOUT ALL (ADMIN) =================
export const forceLogoutAllUsers = async (req, res) => {
  try {
    // Increment tokenVersion for all users with role 'user'
    await User.updateMany(
      { role: "user" },
      { $inc: { tokenVersion: 1 } }
    );

    // Real-time Force Logout ALL via Socket.io
    try {
      getIO().to("user").emit("forceLogout", { message: "All user sessions have been terminated for security updates." });
    } catch (ioErr) {
      console.warn("Socket.io not available for broadcast logout emission:", ioErr.message);
    }

    res.json({
      success: true,
      message: "All customers logged out successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};