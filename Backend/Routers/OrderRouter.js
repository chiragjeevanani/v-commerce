import express from "express";
import { placeOrder, getMyOrders, getOrderDetails } from "../Controller/OrderController.js";
import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(AuthMiddleware);

router.post("/place", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderDetails);

export default router;
