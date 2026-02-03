import express from "express";
import {
    getActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} from "../Controller/HeroBannerController.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

import multer from "multer";
import fs from "fs";
import path from "path";

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

// Public route - no authentication required
router.get("/", getActiveBanners);

// Admin routes - require authentication and admin role
// Note: 'image' is the field name for the file upload
router.post("/", AuthMiddleware, isAdmin, upload.single('image'), createBanner);
router.put("/:id", AuthMiddleware, isAdmin, upload.single('image'), updateBanner);
router.delete("/:id", AuthMiddleware, isAdmin, deleteBanner);

export default router;
