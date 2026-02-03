import mongoose from "mongoose";
import dotenv from "dotenv";
import HeroBanner from "./Models/HeroBannerModel.js";

dotenv.config();

const seedBanners = [
    {
        title: "Summer Collection 2024",
        description: "Discover the hottest trends for the season.",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
        cta: "Shop Now",
        link: "/shop",
        isActive: true,
        order: 1,
    },
    {
        title: "Tech Revolution",
        description: "Upgrade your gear with our latest electronics.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
        cta: "Explore Gadgets",
        link: "/shop?category=Electronics",
        isActive: true,
        order: 2,
    },
    {
        title: "Home & Living",
        description: "Make your home a sanctuary.",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
        cta: "View Collection",
        link: "/shop?category=Home & Living",
        isActive: true,
        order: 3,
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to database");

        // Clear existing banners
        await HeroBanner.deleteMany({});
        console.log("🗑️  Cleared existing banners");

        // Insert seed data
        const result = await HeroBanner.insertMany(seedBanners);
        console.log(`✅ Seeded ${result.length} hero banners`);

        await mongoose.connection.close();
        console.log("✅ Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
