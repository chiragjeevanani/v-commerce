import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const productSchema = new mongoose.Schema({ name: String }, { strict: false });
        const Product = mongoose.model("Product", productSchema, "products");

        const products = await Product.find({}).limit(50);
        console.log("Total (Top 50) Products Names:");
        products.forEach(p => console.log(`- ${p.name}`));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkProducts();
