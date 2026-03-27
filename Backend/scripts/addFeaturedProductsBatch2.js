import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Category from "../Models/CategoryModel.js";
import Product from "../Models/ProductModel.js";
import { dbConnect } from "../Config/dbConnect.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sunglassesPath = "C:/Users/Administrator/.gemini/antigravity/brain/c1c56c91-edd5-4ee8-914a-11e167694966/featured_sunglasses_1774605666705.png";
const keyboardPath = "C:/Users/Administrator/.gemini/antigravity/brain/c1c56c91-edd5-4ee8-914a-11e167694966/featured_keyboard_1774605744660.png";

const addFeaturedProductsBatch2 = async () => {
    try {
        await dbConnect();
        console.log("Connected to database");

        // Find or create categories
        let fashion = await Category.findOne({ name: "Fashion" });
        if (!fashion) {
            fashion = await Category.create({ 
                name: "Fashion", 
                description: "Trendy clothing and accessories",
                image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
                isActive: true
            });
            console.log("Created Fashion category");
        }

        let gaming = await Category.findOne({ name: "Gaming" });
        if (!gaming) {
            gaming = await Category.create({ 
                name: "Gaming", 
                description: "High-performance gaming gear",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
                isActive: true
            });
            console.log("Created Gaming category");
        }

        // Upload images to Cloudinary
        console.log("Uploading sunglasses image...");
        const sgUpload = await cloudinary.v2.uploader.upload(sunglassesPath, { folder: "featured_batch2" });
        
        console.log("Uploading keyboard image...");
        const kbUpload = await cloudinary.v2.uploader.upload(keyboardPath, { folder: "featured_batch2" });

        // Create Sunglasses
        const sunglassesData = {
            name: "Gold-Frame Luxury Aviator Sunglasses",
            description: "Signature gold-frame aviators with premium gradient lenses. Offers 100% UV protection and a timeless, sophisticated aesthetic for any outfit.",
            shortDescription: "Timeless luxury aviator sunglasses with gold frames and gradient lenses.",
            price: 2499,
            compareAtPrice: 4299,
            sku: "FEAT-SG-001-" + Date.now(),
            categoryId: fashion._id,
            images: [sgUpload.secure_url],
            stock: 50,
            trackInventory: true,
            isActive: true,
            isFeatured: true,
            tags: ["fashion", "luxury", "featured", "sunglasses"]
        };

        // Create Keyboard
        const keyboardData = {
            name: "Elite RGB Mechanical Keyboard - Special Edition",
            description: "A masterclass in tactile precision. This 75% mechanical keyboard features hot-swappable switches, a CNC-machined aluminum body, and fully customizable RGB lighting.",
            shortDescription: "Premium 75% mechanical keyboard with aluminum body and hot-swappable RGB.",
            price: 6499,
            compareAtPrice: 9999,
            sku: "FEAT-KB-001-" + Date.now(),
            categoryId: gaming._id,
            images: [kbUpload.secure_url],
            stock: 15,
            trackInventory: true,
            isActive: true,
            isFeatured: true,
            tags: ["gaming", "peripherals", "featured", "keyboard"]
        };

        await Product.create(sunglassesData);
        console.log("Created Featured Sunglasses");

        await Product.create(keyboardData);
        console.log("Created Featured Keyboard");

        console.log("Successfully added 2 more featured products!");
        process.exit(0);
    } catch (error) {
        console.error("Error adding products:", error);
        process.exit(1);
    }
}

addFeaturedProductsBatch2();
