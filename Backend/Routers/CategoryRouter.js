import express from "express";
import {
    getActiveCategories,
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategory,
} from "../Controller/CategoryController.js";
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

const upload = multer({ storage: storage });

// Public routes - no authentication required
router.get("/", getActiveCategories);
router.get("/:id", getCategoryById);
router.get("/:categoryId/subcategories", getSubcategoriesByCategory);

// Admin routes - require authentication and admin role
router.get("/admin/all", AuthMiddleware, isAdmin, getAllCategories);
router.post("/", AuthMiddleware, isAdmin, upload.single('image'), createCategory);
router.put("/:id", AuthMiddleware, isAdmin, upload.single('image'), updateCategory);
router.delete("/:id", AuthMiddleware, isAdmin, deleteCategory);

// Subcategory routes
router.post("/subcategory", AuthMiddleware, isAdmin, createSubcategory);
router.put("/subcategory/:id", AuthMiddleware, isAdmin, updateSubcategory);
router.delete("/subcategory/:id", AuthMiddleware, isAdmin, deleteSubcategory);

export default router;
