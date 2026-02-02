import { Router } from "express";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../Controller/AddressController.js";
import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = Router();

router.use(AuthMiddleware);

router.get("/", getAddresses);
router.post("/add", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.put("/set-default/:addressId", setDefaultAddress);

export default router;
