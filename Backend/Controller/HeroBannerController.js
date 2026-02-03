import HeroBanner from "../Models/HeroBannerModel.js";

import fs from "fs";
import cloudinary from "../Cloudinary/Cloudinary.js";

// ================= GET ACTIVE BANNERS (PUBLIC) =================
export const getActiveBanners = async (req, res) => {
    try {
        const banners = await HeroBanner.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select("-__v");

        res.json({
            success: true,
            message: "Active banners fetched successfully",
            data: banners,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= CREATE BANNER (ADMIN) =================
export const createBanner = async (req, res) => {
    try {
        const { title, description, cta, isActive, order } = req.body;
        const imageFile = req.file;

        if (!title || !description || !cta || !imageFile) {
            // Clean up file if validation fails
            if (imageFile) fs.unlinkSync(imageFile.path);

            return res.status(400).json({
                success: false,
                message: "All fields are required (title, description, image, cta)",
                data: null,
            });
        }

        let imageUrl = "";
        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(imageFile.path, {
                folder: "hero-banners"
            });
            imageUrl = result.secure_url;

            // Delete local file
            fs.unlinkSync(imageFile.path);
        } catch (uploadError) {
            // Clean up file on upload error
            if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
            throw uploadError;
        }

        const banner = await HeroBanner.create({
            title,
            description,
            image: imageUrl,
            cta,
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= UPDATE BANNER (ADMIN) =================
export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, cta, isActive, order } = req.body;
        const imageFile = req.file;

        const banner = await HeroBanner.findById(id);
        if (!banner) {
            // Clean up file if banner not found
            if (imageFile) fs.unlinkSync(imageFile.path);

            return res.status(404).json({
                success: false,
                message: "Banner not found",
                data: null,
            });
        }

        // Handle Image Upload if exists
        if (imageFile) {
            try {
                // Upload new image
                const result = await cloudinary.uploader.upload(imageFile.path, {
                    folder: "hero-banners"
                });
                banner.image = result.secure_url;

                // Delete local file
                fs.unlinkSync(imageFile.path);
            } catch (uploadError) {
                if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
                throw uploadError;
            }
        }

        if (title) banner.title = title;
        if (description) banner.description = description;
        if (cta) banner.cta = cta;
        if (isActive !== undefined) banner.isActive = isActive;
        if (order !== undefined) banner.order = order;

        await banner.save();

        res.json({
            success: true,
            message: "Banner updated successfully",
            data: banner,
        });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= DELETE BANNER (ADMIN) =================
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await HeroBanner.findByIdAndDelete(id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Banner deleted successfully",
            data: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};
