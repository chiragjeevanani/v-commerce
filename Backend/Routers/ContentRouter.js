import express from "express";
import {
    contentUpdate,
    getContent,
    deleteContent,
} from "../Controller/ContentCtrl.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Admin 

router.put("/update-content", AuthMiddleware, isAdmin, contentUpdate);
router.get("/get-content", getContent);
router.delete("/delete-content/:id", AuthMiddleware, isAdmin, deleteContent);

export default router;
