import express from "express";
import {
    registerUser,
    loginUser,
    verifyUser,
    changePassword,
    updateProfile,
    softDeleteUser,
    deleteProfile,
    toggleUserStatus,
    resendOTP,
    userProfile,
    userProfileById,
    setPassword,
} from "../Controller/AuthCtrl.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Admin 
router.post("/register", registerUser);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/verify", verifyUser);

router.post("/change-password", AuthMiddleware, changePassword);
router.post("/setPassword", AuthMiddleware, setPassword);
router.put("/update-profile", AuthMiddleware, updateProfile);
router.get("/profile", AuthMiddleware, userProfile);
router.delete("/soft-delete", AuthMiddleware, softDeleteUser);


// User

router.delete("/delete-profile/:id", AuthMiddleware, isAdmin, deleteProfile);
router.put("/toggle-status/:id", AuthMiddleware, isAdmin, toggleUserStatus);
router.get("/userProfile/:id", AuthMiddleware, isAdmin, userProfileById);


export default router;
