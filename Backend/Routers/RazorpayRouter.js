import express from "express";
import { 
    createRazorpayOrder, 
    verifyPayment, 
    getRazorpaySettings,
    updateRazorpaySettings,
    testRazorpayConnection,
    getRazorpayPublicKey
} from "../Controller/RazorpayCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes (no auth required - safe to expose)
router.get("/public-key", getRazorpayPublicKey);

// Public payment routes (require authentication)
router.post("/create-order", AuthMiddleware, createRazorpayOrder);
router.post("/verify-payment", AuthMiddleware, verifyPayment);

// Admin settings routes (require admin authentication)
router.get("/settings", AuthMiddleware, isAdmin, getRazorpaySettings);
router.put("/settings", AuthMiddleware, isAdmin, updateRazorpaySettings);
router.post("/test-connection", AuthMiddleware, isAdmin, testRazorpayConnection);

export default router;
