import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const newCategories = [
    { 
        name: "Electronics & Gadgets", 
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["watch", "pro", "gadget", "phone", "electronics", "headphone", "v-series"]
    },
    { 
        name: "Fashion & Lifestyle", 
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["glasses", "shirt", "jeans", "fashion", "sunglasses", "designer", "luxury", "leather"]
    },
    { 
        name: "Gaming Gear", 
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["gaming", "keyboard", "mouse", "controller", "pc", "console", "elite"]
    },
    { 
        name: "Home & Kitchen", 
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["kitchen", "home", "cooking", "table", "cookware", "restored"]
    },
    { 
        name: "Health & Beauty", 
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["makeup", "care", "skin", "beauty", "hair", "personal"]
    },
    { 
        name: "Smart Life Accessories", 
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600&h=600",
        keywords: ["smart", "accessory", "gadget", "tech"]
    }
];

async function rebrandEverything() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const categorySchema = new mongoose.Schema({ name: String, image: String, isActive: Boolean }, { strict: false });
        const Category = mongoose.model("Category", categorySchema, "categories");

        const productSchema = new mongoose.Schema({ name: String, categoryId: mongoose.Schema.Types.ObjectId }, { strict: false });
        const Product = mongoose.model("Product", productSchema, "products");

        // 1. Clear existing categories
        await Category.deleteMany({});
        console.log("Cleared old categories");

        // 2. Create 6 main categories
        const createdCats = [];
        for (const catData of newCategories) {
            const cat = await Category.create({
                name: catData.name,
                image: catData.image,
                isActive: true
            });
            createdCats.push({ ...catData, _id: cat._id });
            console.log(`Created: ${cat.name}`);
        }

        // 3. Re-assign products based on keywords
        const products = await Product.find({});
        console.log(`Processing ${products.length} products...`);

        for (const prod of products) {
            const prodNameLower = prod.name.toLowerCase();
            let assignedCat = createdCats[0]; // Default to Electronics

            for (const cat of createdCats) {
                if (cat.keywords.some(kw => prodNameLower.includes(kw))) {
                    assignedCat = cat;
                    break;
                }
            }

            prod.categoryId = assignedCat._id;
            await prod.save();
        }

        console.log("Successfully rebranded all products into the 6 main categories.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

rebrandEverything();
