import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";

const router = Router();

router.use("/api/v1/auth", AuthRouter);

export default router;
