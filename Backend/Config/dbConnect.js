import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully ✅✅✅✅");
  } catch (error) {
    console.error("Database error ❌❌❌❌", error.message);
  }
};
