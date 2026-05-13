import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import upload from "../middleware/upload.js";


// ================= CONTROLLERS =================
import {
  createLaporan,
  getAllLaporan,
  getLaporanById,
  updateStatusLaporan,
  deleteLaporan,
  getCategories,
  getAllLaporanAdmin,
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
  register,
  login,
  getProfile,
  updateProfile ,
} from "../controllers/userController.js";

const router = express.Router();


// ======================================================
// AUTH
// ======================================================

// REGISTER
router.post(
  "/register",
  register
);

// LOGIN
router.post(
  "/login",
  login
);

// PROFILE
router.get(
  "/profile",
  auth,
  getProfile
);
router.put("/profile", auth, updateProfile);


// ======================================================
// USER LAPORAN
// ======================================================

// GET ALL LAPORAN USER
router.get(
  "/laporan",
  auth,
  getAllLaporan
);

// CREATE LAPORAN
router.post(
  "/laporan",
  auth,
  upload.single("foto"),
  createLaporan
);

// DETAIL LAPORAN
router.get(
  "/laporan/:id",
  auth,
  getLaporanById
);


// ======================================================
// ADMIN
// ======================================================

// GET ALL LAPORAN ADMIN
router.get(
  "/admin/laporan",
  auth,
  role("admin", "super_admin"),
  getAllLaporanAdmin
);

// UPDATE STATUS LAPORAN
router.put(
  "/admin/laporan/:id/status",
  auth,
  role("admin", "super_admin"),
  updateStatusLaporan
);

// DELETE LAPORAN
router.delete(
  "/admin/laporan/:id",
  auth,
  role("admin", "super_admin"),
  deleteLaporan
);


// ======================================================
// CATEGORY
// ======================================================

router.get(
  "/categories",
  auth,
  getCategories
);


// ======================================================
// COMMENT
// ======================================================

// ADD COMMENT
router.post(
  "/comments",
  auth,
  addComment
);

// DELETE COMMENT
router.delete(
  "/comments/:id",
  auth,
  deleteComment
);


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/admin/dashboard",
  auth,
  role("admin", "super_admin"),
  getDashboardAdmin
);


// ================= ADMIN PROFILE =================

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

export default router;