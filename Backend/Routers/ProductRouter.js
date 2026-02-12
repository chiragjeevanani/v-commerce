import express from "express";
import {
    getActiveProducts,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../Controller/ProductController.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

import multer from "multer";
import fs from "fs";

const router = express.Router();

// Configure Multer for disk storage
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public routes - no authentication required
router.get("/", getActiveProducts);
router.get("/:id", getProductById);

// Admin routes - require authentication and admin role
router.get("/admin/all", AuthMiddleware, isAdmin, getAllProducts);
router.post("/", AuthMiddleware, isAdmin, upload.array('images', 10), createProduct); // Max 10 images
router.put("/:id", AuthMiddleware, isAdmin, upload.array('images', 10), updateProduct);
router.delete("/:id", AuthMiddleware, isAdmin, deleteProduct);

export default router;
