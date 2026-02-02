import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart
} from "../Controller/CartController.js";
import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = Router();

// All cart routes require authentication
router.use(AuthMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:pid", removeFromCart);
router.delete("/clear", clearCart);
router.post("/sync", syncCart);

export default router;
