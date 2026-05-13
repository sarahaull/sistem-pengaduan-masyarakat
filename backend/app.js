import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";

import router from "./routes/index.js";
import chatRoute from "./routes/chatRoute.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// folder uploads
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// debug
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// ROUTES
app.use("/api", router);
app.use("/api/chat", chatRoute); // FIX HERE

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});