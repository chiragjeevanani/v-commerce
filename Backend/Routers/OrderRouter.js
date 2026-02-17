import express from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    getOrdersByUserId,
    getRecentOrders,
    updateOrderStatus
} from "../Controller/OrderController.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(AuthMiddleware);

router.post("/place", placeOrder);
router.get("/my-orders", getMyOrders);

// Admin Routes
router.get("/admin/all", isAdmin, getAllOrders);
router.get("/admin/recent", isAdmin, getRecentOrders);
router.get("/admin/user/:userId", isAdmin, getOrdersByUserId);
router.get("/admin/:id", isAdmin, getAdminOrderDetails);
router.put("/admin/:id/status", isAdmin, updateOrderStatus);

// User Routes (Order detail must vary based on user unless admin logic is separate, 
// but here we used specific admin endpoints to avoid conflict or need for conditional logic in controller)
router.get("/:orderId", getOrderDetails);

export default router;
