import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function listCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const categorySchema = new mongoose.Schema({}, { strict: false });
        const Category = mongoose.model("Category", categorySchema, "categories");

        const categories = await Category.find({}).limit(5);
        console.log(JSON.stringify(categories, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

listCategories();
