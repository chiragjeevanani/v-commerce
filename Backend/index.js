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

import http from "http";
import { initSocket } from "./Config/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

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

// ... [rest of the app.use static logic] ...
app.use(express.static(distPath, {
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
    if (mimeTypes[ext]) res.setHeader('Content-Type', mimeTypes[ext]);
  },
  redirect: false,
  index: false,
}));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(req.originalUrl.split('?')[0]);
  if (hasFileExtension) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handler
app.use(errorHandler);

// Start
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
