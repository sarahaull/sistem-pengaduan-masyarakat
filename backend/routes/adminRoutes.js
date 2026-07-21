import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
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
  deleteLaporanAdmin,
  updateStatusLaporan, 
} from "../controllers/adminController.js";
import {
  getAllCommentsAdmin,
  updateCommentAdmin,
  deleteCommentAdmin,
  addReplyComment,
} from "../controllers/commentadminController.js";

const router = express.Router();

router.use(auth);
router.use(role("admin", 'super_admin')); // atau role(["admin", "super_admin"])

// Dashboard & Profile
router.get("/dashboard", getDashboardAdmin);
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.post("/upload-foto", uploadAdminFoto);
router.put("/change-password", changeAdminPassword);

// Laporan
router.get("/laporan", getAdminLaporan);
router.delete("/laporan/:id", deleteLaporanAdmin);
router.put("/laporan/:id/status", updateStatusLaporan);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

// Comments ✅ (yang kurang)
router.get("/comments", getAllCommentsAdmin);
router.put("/comments/:id", updateCommentAdmin);
router.delete("/comments/:id", deleteCommentAdmin);
router.post("/comments", addReplyComment);

export default router;