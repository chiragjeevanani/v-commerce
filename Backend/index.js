import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { dbConnect } from "./Config/dbConnect.js";
import { errorHandler } from "./Helpers/helpers.js";
import routes from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// DB
dbConnect();

// Middlewares
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

/* ================= API FIRST ================= */
app.use("/api", routes);

/* ================= FRONTEND ================= */
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));

/* ========== SPA FALLBACK (EXPRESS v5 SAFE) ========== */
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return next(); // let API 404 handle
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handler
app.use(errorHandler);

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
