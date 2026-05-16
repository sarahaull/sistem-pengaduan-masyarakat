import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";

import router from "./routes/index.js";
import chatRoute from "./routes/chatRoute.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminCommentRoutes from "./routes/adminCommentRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// debug logger (taruh di atas routes)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// routes
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", router);
app.use("/api/chat", chatRoute);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/comments", adminCommentRoutes);

app.use((err, req, res, next) => {
  console.log("🔥 SERVER ERROR:", err);
  res.status(500).json({ message: err.message });
});


// uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


app.use((err, req, res, next) => {
  console.log("🔥 BACKEND ERROR:", err);
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});