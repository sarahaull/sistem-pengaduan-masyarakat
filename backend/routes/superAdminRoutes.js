import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { getAllLaporanAdmin } from "../controllers/laporanController.js";

import {
   getAllLaporan,
  getSuperAdminStats,
  getRecentUsers,
  getRecentLaporan,
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
  getActivityLogs,
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
router.get("/laporan", auth, role("super_admin"), getAllLaporanAdmin);

// USERS MANAGEMENT
router.get("/users", getAllUsers);

router.post("/users", createUser);

router.put("/users/:id", updateUser);
router.get("/laporan", getAllLaporan);

router.delete("/user/:id", deleteUser);
router.get("/activity-logs", auth, getActivityLogs);

router.get(
  "/activity-logs",
  auth,
  (req, res, next) => {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied (bukan super admin)" });
    }
    next();
  },
  getActivityLogs
);



export default router;