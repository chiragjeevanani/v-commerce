import jwt from "jsonwebtoken";

export const generateToken = (id, version = 0) => {
  return jwt.sign({ id, version }, process.env.JWT_SECRET, { expiresIn: "365d" });
};
