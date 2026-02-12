import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import CJDropshippingRouter from "./Routers/CJDropshippingRouter.js";
import CartRouter from "./Routers/CartRouter.js";
import AddressRouter from "./Routers/AddressRouter.js";
import OrderRouter from "./Routers/OrderRouter.js";
import HeroBannerRouter from "./Routers/HeroBannerRouter.js";
import AnalyticsRouter from "./Routers/AnalyticsRouter.js";
import ContentRouter from "./Routers/ContentRouter.js";
import UploadRouter from "./Routers/UploadRouter.js";
import RazorpayRouter from "./Routers/RazorpayRouter.js";
import CategoryRouter from "./Routers/CategoryRouter.js";
import ProductRouter from "./Routers/ProductRouter.js";

const router = Router();

router.use("/v1/auth", AuthRouter);
router.use("/v1/cj", CJDropshippingRouter);
router.use("/v1/cart", CartRouter);
router.use("/v1/addresses", AddressRouter);
router.use("/v1/orders", OrderRouter);
router.use("/v1/hero-banners", HeroBannerRouter);
router.use("/v1/admin/analytics", AnalyticsRouter);
router.use("/v1/content", ContentRouter);
router.use("/v1/upload", UploadRouter);
router.use("/v1/razorpay", RazorpayRouter);
router.use("/v1/categories", CategoryRouter);
router.use("/v1/store-products", ProductRouter);

export default router;
