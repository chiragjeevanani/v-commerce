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

// Serve static files with proper MIME types
app.use(express.static(distPath, {
  // Set proper MIME types for different file extensions
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  },
  // Don't redirect, just serve files
  redirect: false,
  // Enable index file serving
  index: false,
}));

/* ========== SPA FALLBACK (EXPRESS v5 SAFE) ========== */
app.use((req, res, next) => {
  // Skip API routes
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  
  // Skip static asset requests (files with extensions)
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(req.originalUrl.split('?')[0]);
  if (hasFileExtension) {
    return next(); // Let express.static handle it or return 404
  }
  
  // For all other routes, serve index.html (SPA fallback)
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handler
app.use(errorHandler);

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
