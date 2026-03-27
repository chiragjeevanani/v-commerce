import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function fixGamingCategory() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const categorySchema = new mongoose.Schema({ name: String, image: String }, { strict: false });
        const Category = mongoose.model("Category", categorySchema, "categories");

        const newGamingImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400&h=400";

        const result = await Category.findOneAndUpdate(
            { name: "Gaming" },
            { image: newGamingImage },
            { new: true }
        );

        if (result) {
            console.log("Successfully fixed Gaming category image.");
        } else {
            console.log("Gaming category not found.");
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

fixGamingCategory();
