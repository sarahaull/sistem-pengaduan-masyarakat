import express from "express";
import multer from "multer";
import path from "path";

import auth from "../middleware/auth.js";

import {
  getDashboardAdmin,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminFoto,
  changeAdminPassword,
  getAdminLaporan,
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ROUTES
router.get("/dashboard", auth, getDashboardAdmin);
router.get("/profile", auth, getAdminProfile);
router.put("/profile", auth, updateAdminProfile);

router.get("/laporan", auth, getAdminLaporan);

router.post("/upload-foto", auth, upload.single("foto"), uploadAdminFoto);

router.put("/change-password", auth, changeAdminPassword);

// USERS ADMIN
router.get("/users", auth, getAllUsers);
router.delete("/users/:id", auth, deleteUser);
router.put("/users/:id", auth, updateUserRole);



export default router;