import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import router from "./routes/index.js";
import chatRoute from "./routes/chatRoute.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import laporanRoutes from "./routes/laporan.js";
import adminCommentRoutes from "./routes/adminCommentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";

dotenv.config(); // pindahkan ke atas

const app = express(); // ✅ HARUS DI ATAS SEMUA app.use


// middleware
// middleware
app.use(cors());

app.use(express.json({ limit: "20mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// routes (SEMUA DI SINI)
app.use("/api/auth", authRoutes);
app.use("/api", router);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admin-comments", adminCommentRoutes);
app.use("/api/chat", chatRoute);
app.use("/api", laporanRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoriesRoutes);

// static folder
app.use("/uploads", express.static("uploads"));

// debug logger
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// error handler (taruh PALING BAWAH middleware)
app.use((err, req, res, next) => {
  console.log("🔥 BACKEND ERROR:", err);

  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

// ================= SOCKET IO =================
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// ================= START SERVER =================
const PORT = 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});