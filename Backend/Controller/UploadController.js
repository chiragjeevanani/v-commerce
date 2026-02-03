import User from "../Models/AuthModel.js";
import ContentModel from "../Models/ContentModel.js";
import cloudinary from "../Cloudinary/Cloudinary.js";
import fs from "fs";

export const uploadAvatar = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "admin-avatars"
        });

        // Delete local file
        fs.unlinkSync(file.path);

        // Update User
        const user = await User.findById(req.user._id);
        user.avatar = result.secure_url;
        await user.save();

        res.json({
            success: true,
            message: "Avatar updated successfully",
            data: { avatar: user.avatar }
        });
    } catch (error) {
        console.error("Avatar Upload Error:", error);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        res.status(500).json({ success: false, message: "Upload failed" });
    }
};

export const uploadStoreLogo = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "store-assets"
        });

        // Delete local file
        fs.unlinkSync(file.path);

        // Update Content
        let contentData = await ContentModel.findOne({ contentType: 'store_settings' });
        if (!contentData) {
            // Should exist if settings accessed first, but safe create
            contentData = new ContentModel({
                contentType: 'store_settings',
                content: {}
            });
        }

        // Ensure content is object (it is Mixed type now)
        if (!contentData.content) contentData.content = {};

        // Mongoose Mixed type needs markModified if we mutate
        contentData.content = { ...contentData.content, storeLogo: result.secure_url };
        contentData.markModified('content');

        await contentData.save();

        res.json({
            success: true,
            message: "Store logo updated successfully",
            data: { storeLogo: result.secure_url }
        });
    } catch (error) {
        console.error("Logo Upload Error:", error);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        res.status(500).json({ success: false, message: "Upload failed" });
    }
};
