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

const router = Router();

router.use("/api/v1/auth", AuthRouter);
router.use("/api/v1/cj", CJDropshippingRouter);
router.use("/api/v1/cart", CartRouter);
router.use("/api/v1/addresses", AddressRouter);
router.use("/api/v1/orders", OrderRouter);
router.use("/api/v1/hero-banners", HeroBannerRouter);
router.use("/api/v1/admin/analytics", AnalyticsRouter);
router.use("/api/v1/content", ContentRouter);
router.use("/api/v1/upload", UploadRouter);

export default router;
