import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import upload from "../middleware/upload.js";


// controllers
import {
  createLaporan,
  getAllLaporan,
  getLaporanById,
  updateStatusLaporan,
  deleteLaporan,
  getCategories,
  getAllLaporanAdmin,
   updateLaporan
} from "../controllers/laporanController.js";

import {
  addComment,
  deleteComment,
} from "../controllers/commentController.js";

import {
  getDashboardAdmin,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminFoto,
  changeAdminPassword,
} from "../controllers/adminController.js";

import {
  getSuperAdminDashboard,
  getAllUsers,
  createAdmin,
  deleteUser,
  getAllLaporanSuperAdmin,
} from "../controllers/superAdminController.js";

import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/register", register);
router.post("/login", login);

/* ================= PROFILE ================= */
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

/* ================= LAPORAN USER ================= */
router.get("/laporan", auth, getAllLaporan);
router.post("/laporan", auth, upload.single("foto"), createLaporan);
router.get("/laporan/:id", auth, getLaporanById);
router.put("/laporan/:id", auth, updateLaporan);
router.delete("/laporan/:id", auth, deleteLaporan);

/* ================= ADMIN + SUPER ADMIN LAPORAN ================= */
router.get(
  "/admin/laporan",
  auth,
  role("admin", "super_admin"),
  getAllLaporanAdmin
);

router.put(
  "/admin/laporan/:id/status",
  auth,
  role("admin", "super_admin"),
  updateStatusLaporan
);

router.delete(
  "/admin/laporan/:id",
  auth,
  role("admin", "super_admin"),
  deleteLaporan
);

/* ================= CATEGORY ================= */
router.get("/categories", auth, getCategories);

/* ================= COMMENT ================= */
router.post("/comments", auth, addComment);
router.delete("/comments/:id", auth, deleteComment);

/* ================= ADMIN DASHBOARD ================= */
router.get(
  "/admin/dashboard",
  auth,
  role("admin", "super_admin"), // 🔥 FIX PENTING
  getDashboardAdmin
);

/* ================= SUPER ADMIN ================= */
router.get(
  "/super-admin/dashboard",
  auth,
  role("super_admin"),
  getSuperAdminDashboard
);

router.get(
  "/super-admin/users",
  auth,
  role("super_admin"),
  getAllUsers
);

router.post(
  "/super-admin/create-admin",
  auth,
  role("super_admin"),
  createAdmin
);

router.delete(
  "/super-admin/user/:id",
  auth,
  role("super_admin"),
  deleteUser
);

router.get(
  "/super-admin/laporan",
  auth,
  role("super_admin"),
  getAllLaporanSuperAdmin
);

/* ================= ADMIN PROFILE ================= */
router.get(
  "/admin/profile",
  auth,
  role("admin", "super_admin"),
  getAdminProfile
);

router.put(
  "/admin/profile",
  auth,
  role("admin", "super_admin"),
  updateAdminProfile
);

router.post(
  "/admin/upload-foto",
  auth,
  role("admin", "super_admin"),
  upload.single("foto"),
  uploadAdminFoto
);

router.put(
  "/admin/change-password",
  auth,
  role("admin", "super_admin"),
  changeAdminPassword
);

router.get("/comments", auth, async (req, res) => {
  const { laporan_id } = req.query;

  try {
    const Comment = (await import("../models/comment.js")).default;

    const data = await Comment.findByLaporanId(laporan_id);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;