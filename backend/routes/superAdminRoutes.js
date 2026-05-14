import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

import {
  getSuperAdminStats,
  getRecentUsers,
  getRecentLaporan,
  getAllUsers,
  deleteUser,
} from "../controllers/superAdminController.js";

const router = express.Router();

// middleware protection
router.use(auth);
router.use(role("super_admin"));

// DASHBOARD STATS
router.get("/stats", getSuperAdminStats);

// RECENT DATA
router.get("/recent-users", getRecentUsers);
router.get("/recent-laporan", getRecentLaporan);

// USERS MANAGEMENT
router.get("/users", getAllUsers);
router.delete("/user/:id", deleteUser);



export default router;