import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 30000, // 30 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log("Database Connected Successfully ✅✅✅✅");
  } catch (error) {
    console.error("Database error ❌❌❌❌", error.message);
    // Don't exit process, let it retry
  }
};
