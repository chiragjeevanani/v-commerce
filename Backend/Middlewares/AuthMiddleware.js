import User from '../Models/AuthModel.js'
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const AuthMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token, please login" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded?.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token invalid, please login again" });
  }
});


export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const { email } = req.user;
  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    return res.status(401).json({ message: "You are not an admin!" });
  }
  
  next();
});