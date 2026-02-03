import express from "express";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";
import {
    getKPIData,
    getSalesChartData,
    getOrderStatusDistribution
} from "../Controller/AnalyticsController.js";

const router = express.Router();

router.use(AuthMiddleware);
router.use(isAdmin);

router.get("/kpis", getKPIData);
router.get("/sales", getSalesChartData);
router.get("/order-status", getOrderStatusDistribution);

export default router;
