import express from "express";
import { createRazorpayOrder, verifyPayment } from "../Controller/RazorpayCtrl.js";
import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/create-order", AuthMiddleware, createRazorpayOrder);
router.post("/verify-payment", AuthMiddleware, verifyPayment);

export default router;
