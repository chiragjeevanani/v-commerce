import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listAllCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const categorySchema = new mongoose.Schema({ name: String, image: String }, { strict: false });
        const Category = mongoose.model("Category", categorySchema, "categories");

        const categories = await Category.find({});
        console.log("Total Categories:", categories.length);
        console.log(JSON.stringify(categories.map(c => ({ id: c._id, name: c.name, image: c.image })), null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

listAllCategories();
