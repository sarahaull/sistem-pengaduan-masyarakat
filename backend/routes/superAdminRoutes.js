import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

import {
  getSuperAdminStats,
  getRecentUsers,
  getRecentLaporan,
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
  getActivityLogs,
  getAllLaporanSuperAdmin
} from "../controllers/superAdminController.js";

const router = express.Router();

// apply middleware sekali saja
router.use(auth);
router.use(role("super_admin"));

// DASHBOARD
router.get("/stats", getSuperAdminStats);
router.get("/recent-users", getRecentUsers);
router.get("/recent-laporan", getRecentLaporan);

// USERS
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// LAPORAN
router.get("/laporan", getAllLaporanSuperAdmin);

// ACTIVITY
router.get("/activity-logs", getActivityLogs);

export default router;