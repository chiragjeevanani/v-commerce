import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../Models/CategoryModel.js";
import { dbConnect } from "../Config/dbConnect.js";

dotenv.config();

const basicCategories = [
  {
    name: "Electronics",
    description: "Latest electronic gadgets and accessories for everyday use.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
  },
  {
    name: "Home & Kitchen",
    description: "Essentials and decor to upgrade your home and kitchen.",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop",
  },
  {
    name: "Fashion",
    description: "Trendy clothing and accessories for a modern lifestyle.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
  },
];

const seedBasicCategories = async () => {
  try {
    await dbConnect();

    const createdOrExisting = [];

    for (const cat of basicCategories) {
      const payload = {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        isActive: true,
        allowPartialPayment: false,
      };

      let category = await Category.findOne({ name: payload.name });
      if (!category) {
        category = await Category.create(payload);
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
      createdOrExisting.push(category);
    }

    console.log(`\n✅ Basic categories ready: ${createdOrExisting.map(c => c.name).join(", ")}\n`);
  } catch (error) {
    console.error("Error seeding basic categories:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run directly when this script is executed
seedBasicCategories();

