import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      default: "user", // user | admin
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpire: Date,

    resetToken: String,
    resetTokenExpire: Date,

    addresses: [
      {
        fullName: String,
        addressType: { type: String, default: "Home" }, // Home, Work, etc.
        street: String,
        city: String,
        state: String,
        country: { type: String, default: "India" },
        zipCode: String,
        phoneNumber: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
