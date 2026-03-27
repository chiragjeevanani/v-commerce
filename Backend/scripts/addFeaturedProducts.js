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

const smartwatchPath = "C:/Users/Administrator/.gemini/antigravity/brain/c1c56c91-edd5-4ee8-914a-11e167694966/featured_smartwatch_1774604432046.png";
const headphonesPath = "C:/Users/Administrator/.gemini/antigravity/brain/c1c56c91-edd5-4ee8-914a-11e167694966/featured_headphones_1774604480619.png";

const addFeaturedProducts = async () => {
    try {
        await dbConnect();
        console.log("Connected to database");

        // Find or create 'Electronics' category
        let electronics = await Category.findOne({ name: "Electronics" });
        if (!electronics) {
            electronics = await Category.create({ 
                name: "Electronics", 
                description: "Premium gadgets and electronics",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
                isActive: true
            });
            console.log("Created Electronics category");
        }

        // Upload images to Cloudinary
        console.log("Uploading smartwatch image to Cloudinary...");
        const swUpload = await cloudinary.v2.uploader.upload(smartwatchPath, { folder: "featured_test" });
        
        console.log("Uploading headphones image to Cloudinary...");
        const hpUpload = await cloudinary.v2.uploader.upload(headphonesPath, { folder: "featured_test" });

        // Create Featured Smartwatch
        const swatchData = {
            name: "Galaxy SmartWatch Ultra V-Series",
            description: "Experience the pinnacle of wearable technology with our Ultra V-Series. Features include 48h battery life, 5ATM water resistance, and state-of-the-art health tracking including ECG and SPO2.",
            shortDescription: "The ultimate premium smartwatch for elite performance and health tracking.",
            price: 7999,
            compareAtPrice: 12999,
            sku: "FEAT-SW-001-" + Date.now(),
            categoryId: electronics._id,
            images: [swUpload.secure_url],
            stock: 25,
            trackInventory: true,
            isActive: true,
            isFeatured: true, // IMPORTANT
            tags: ["electronics", "premium", "featured", "watch"]
        };

        // Create Featured Headphones
        const headphonesData = {
            name: "V-Pro Noise Cancelling Wireless Headphones",
            description: "Surround yourself with pure sound. The V-Pro features active hybrid noise cancellation, 40-hour playtime, and ultra-comfortable memory foam earpads for all-day listening.",
            shortDescription: "Premium wireless headphones with advanced studio-grade noise cancellation.",
            price: 4499,
            compareAtPrice: 6999,
            sku: "FEAT-HP-001-" + Date.now(),
            categoryId: electronics._id,
            images: [hpUpload.secure_url],
            stock: 40,
            trackInventory: true,
            isActive: true, // visible
            isFeatured: true, // IMPORTANT
            tags: ["electronics", "premium", "featured", "headphones"]
        };

        await Product.create(swatchData);
        console.log("Created Featured Smartwatch product");

        await Product.create(headphonesData);
        console.log("Created Featured Headphones product");

        console.log("Successfully added 2 featured products with custom images!");
        process.exit(0);
    } catch (error) {
        console.error("Error adding featured products:", error);
        process.exit(1);
    }
}

addFeaturedProducts();
