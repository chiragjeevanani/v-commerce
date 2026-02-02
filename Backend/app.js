import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import CJDropshippingRouter from "./Routers/CJDropshippingRouter.js";
import CartRouter from "./Routers/CartRouter.js";
import AddressRouter from "./Routers/AddressRouter.js";
import OrderRouter from "./Routers/OrderRouter.js";

const router = Router();

router.use("/api/v1/auth", AuthRouter);
router.use("/api/v1/cj", CJDropshippingRouter);
router.use("/api/v1/cart", CartRouter);
router.use("/api/v1/addresses", AddressRouter);
router.use("/api/v1/orders", OrderRouter);

export default router;
