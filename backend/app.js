import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Routes
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

dotenv.config();

const app = express();

// =======================
// MIDDLEWARE
// =======================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// Folder Upload
app.use("/uploads", express.static("uploads"));

// =======================
// ROUTES
// =======================

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

// =======================
// DEBUG LOGGER
// =======================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// =======================
// ERROR HANDLER
// =======================

app.use((err, req, res, next) => {
  console.error("🔥 BACKEND ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =======================
// SOCKET.IO
// =======================

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});