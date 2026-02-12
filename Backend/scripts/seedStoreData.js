import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../Models/CategoryModel.js";
import Product from "../Models/ProductModel.js";
import { dbConnect } from "../Config/dbConnect.js";

dotenv.config();

// Valid image URLs from Unsplash (these will work)
const getCategoryImage = (index) => {
    const images = [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
    ];
    return images[index % images.length];
};

const getProductImages = (index) => {
    const baseImages = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    ];
    // Return 3-5 images per product
    const numImages = 3 + (index % 3);
    return Array.from({ length: numImages }, (_, i) => {
        const imgIndex = (index + i) % baseImages.length;
        return baseImages[imgIndex];
    });
};

const categories = [
    { name: "Electronics", description: "Latest electronic gadgets and devices" },
    { name: "Fashion", description: "Trendy clothing and accessories for all" },
    { name: "Home & Kitchen", description: "Everything for your home and kitchen" },
    { name: "Sports & Outdoors", description: "Sports equipment and outdoor gear" },
    { name: "Books & Media", description: "Books, movies, and entertainment" },
    { name: "Beauty & Personal Care", description: "Beauty products and personal care items" },
    { name: "Toys & Games", description: "Fun toys and games for all ages" },
    { name: "Automotive", description: "Car accessories and automotive products" },
    { name: "Health & Fitness", description: "Health and fitness equipment" },
    { name: "Pet Supplies", description: "Everything for your furry friends" },
    { name: "Office Supplies", description: "Office essentials and stationery" },
    { name: "Garden & Tools", description: "Gardening tools and outdoor equipment" },
    { name: "Baby Products", description: "Products for babies and toddlers" },
    { name: "Jewelry & Watches", description: "Elegant jewelry and timepieces" },
    { name: "Musical Instruments", description: "Instruments for music lovers" },
    { name: "Travel & Luggage", description: "Travel essentials and luggage" },
    { name: "Food & Beverages", description: "Delicious food and drinks" },
    { name: "Art & Crafts", description: "Art supplies and craft materials" },
    { name: "Furniture", description: "Modern and classic furniture pieces" },
    { name: "Gaming", description: "Gaming consoles and accessories" },
];

const productNames = [
    // Electronics
    ["Wireless Bluetooth Headphones", "Smart Watch Pro", "Portable Power Bank", "USB-C Cable", "Wireless Mouse"],
    // Fashion
    ["Cotton T-Shirt", "Denim Jeans", "Leather Jacket", "Running Shoes", "Designer Sunglasses"],
    // Home & Kitchen
    ["Coffee Maker", "Non-Stick Cookware Set", "Kitchen Knife Set", "Dining Table", "Wall Clock"],
    // Sports & Outdoors
    ["Yoga Mat", "Dumbbell Set", "Tennis Racket", "Camping Tent", "Hiking Backpack"],
    // Books & Media
    ["Best Seller Novel", "Educational Book", "Comic Book", "Music CD", "Movie DVD"],
    // Beauty & Personal Care
    ["Face Moisturizer", "Shampoo & Conditioner", "Perfume", "Makeup Kit", "Hair Dryer"],
    // Toys & Games
    ["Board Game", "Action Figure", "Puzzle Set", "Remote Control Car", "Building Blocks"],
    // Automotive
    ["Car Phone Mount", "Car Charger", "Car Air Freshener", "Car Cover", "Tire Pressure Gauge"],
    // Health & Fitness
    ["Protein Powder", "Resistance Bands", "Foam Roller", "Water Bottle", "Fitness Tracker"],
    // Pet Supplies
    ["Dog Food", "Cat Litter", "Pet Toy", "Pet Bed", "Pet Leash"],
    // Office Supplies
    ["Notebook Set", "Pen Holder", "Desk Organizer", "Stapler", "Paper Clips"],
    // Garden & Tools
    ["Garden Shovel", "Pruning Shears", "Garden Gloves", "Watering Can", "Plant Pots"],
    // Baby Products
    ["Baby Stroller", "Baby Bottle", "Baby Clothes", "Diaper Bag", "Baby Toys"],
    // Jewelry & Watches
    ["Gold Necklace", "Silver Ring", "Diamond Earrings", "Leather Watch", "Bracelet Set"],
    // Musical Instruments
    ["Acoustic Guitar", "Keyboard", "Drum Set", "Violin", "Microphone"],
    // Travel & Luggage
    ["Suitcase", "Travel Backpack", "Passport Holder", "Travel Pillow", "Luggage Tag"],
    // Food & Beverages
    ["Organic Tea", "Coffee Beans", "Chocolate Box", "Snack Pack", "Energy Drink"],
    // Art & Crafts
    ["Paint Brush Set", "Canvas", "Sketchbook", "Colored Pencils", "Clay Set"],
    // Furniture
    ["Office Chair", "Coffee Table", "Bookshelf", "Dining Chair", "Sofa"],
    // Gaming
    ["Gaming Mouse", "Gaming Keyboard", "Gaming Headset", "Controller", "Gaming Mouse Pad"],
];

const productDescriptions = [
    "Premium quality product designed for durability and performance. Made with high-grade materials to ensure long-lasting use.",
    "Stylish and modern design that fits perfectly in any setting. Features advanced technology for optimal functionality.",
    "Eco-friendly product made from sustainable materials. Perfect for environmentally conscious consumers.",
    "Professional grade product suitable for both beginners and experts. Comes with comprehensive user manual.",
    "Compact and portable design makes it easy to carry anywhere. Ideal for travel and daily use.",
    "Innovative features that make your life easier. Backed by manufacturer warranty and customer support.",
    "Elegant design that adds style to your space. Available in multiple colors and sizes.",
    "High-performance product tested and approved by professionals. Meets international quality standards.",
    "User-friendly interface makes it easy to operate. Perfect for all age groups.",
    "Durable construction ensures years of reliable service. Great value for money.",
];

const seedData = async () => {
    try {
        // Connect to database
        await dbConnect();
        console.log("Connected to database");

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await Category.deleteMany({});
        // await Product.deleteMany({});
        // console.log("Cleared existing data");

        // Create categories
        const createdCategories = [];
        for (let i = 0; i < categories.length; i++) {
            const categoryData = {
                ...categories[i],
                image: getCategoryImage(i),
                isActive: true,
            };

            // Check if category already exists
            let category = await Category.findOne({ name: categoryData.name });
            if (!category) {
                category = await Category.create(categoryData);
                console.log(`Created category: ${category.name}`);
            } else {
                console.log(`Category already exists: ${category.name}`);
            }
            createdCategories.push(category);
        }

        console.log(`\nCreated ${createdCategories.length} categories\n`);

        // Create products (5 per category = 100 products)
        let productCount = 0;
        for (let catIndex = 0; catIndex < createdCategories.length; catIndex++) {
            const category = createdCategories[catIndex];
            const categoryProducts = productNames[catIndex] || productNames[0];

            for (let prodIndex = 0; prodIndex < categoryProducts.length; prodIndex++) {
                const productName = categoryProducts[prodIndex];
                const basePrice = 500 + Math.floor(Math.random() * 9500); // ₹500 to ₹10,000
                const compareAtPrice = basePrice + Math.floor(Math.random() * 2000); // Higher than base price
                const sku = `STORE-${String(catIndex + 1).padStart(2, '0')}-${String(prodIndex + 1).padStart(3, '0')}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                const productData = {
                    name: productName,
                    description: productDescriptions[prodIndex % productDescriptions.length],
                    shortDescription: `${productName} - Premium quality product with excellent features.`,
                    price: basePrice,
                    compareAtPrice: compareAtPrice,
                    sku: sku,
                    categoryId: category._id,
                    images: getProductImages(productCount),
                    stock: 50 + Math.floor(Math.random() * 200), // 50 to 250
                    trackInventory: true,
                    isActive: true,
                    tags: [category.name.toLowerCase(), "premium", "quality"],
                };

                // Check if product already exists
                let product = await Product.findOne({ sku: productData.sku });
                if (!product) {
                    product = await Product.create(productData);
                    productCount++;
                    console.log(`Created product ${productCount}: ${product.name} (${category.name})`);
                } else {
                    console.log(`Product already exists: ${product.name}`);
                }
            }
        }

        console.log(`\n✅ Successfully created ${productCount} products\n`);
        console.log("Seed data insertion completed!");

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the seed function
seedData();
