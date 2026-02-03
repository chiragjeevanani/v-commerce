import express from "express";
import multer from "multer";
import fs from "fs";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";
import { uploadAvatar, uploadStoreLogo } from "../Controller/UploadController.js";

const router = express.Router();

// Configure Multer for disk storage (Same as HeroBannerRouter)
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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin Avatar Upload
router.post("/admin/avatar", AuthMiddleware, upload.single("image"), uploadAvatar);

// Store Logo Upload
router.post("/settings/store/logo", AuthMiddleware, isAdmin, upload.single("image"), uploadStoreLogo);

export default router;
