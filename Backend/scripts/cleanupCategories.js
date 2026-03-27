import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const keepCategories = [
    { 
        name: "Electronics", 
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400&h=400" 
    },
    { 
        name: "Fashion", 
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=400" 
    },
    { 
        name: "Gaming", 
        image: "https://images.unsplash.com/photo-1538356111083-74819827bbbb?auto=format&fit=crop&q=80&w=400&h=400" 
    },
    { 
        name: "Home & Kitchen", 
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=400&h=400" 
    },
    { 
        name: "Beauty & Personal Care", 
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&h=400" 
    },
    { 
        name: "Books & Media", 
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=400&h=400" 
    }
];

async function cleanupCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const categorySchema = new mongoose.Schema({ name: String, image: String, isActive: Boolean }, { strict: false });
        const Category = mongoose.model("Category", categorySchema, "categories");

        // 1. Delete all categories NOT in our keep list
        const keepNames = keepCategories.map(c => c.name);
        await Category.deleteMany({ name: { $nin: keepNames } });
        console.log("Deleted extra categories");

        // 2. Update or create the 6 categories we want to keep
        for (const cat of keepCategories) {
            await Category.findOneAndUpdate(
                { name: cat.name },
                { image: cat.image, isActive: true },
                { upsert: true, new: true }
            );
            console.log(`Updated/Created: ${cat.name}`);
        }

        console.log("Successfully cleaned up categories to top 6 with images.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

cleanupCategories();
