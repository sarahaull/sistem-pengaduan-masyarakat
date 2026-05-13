import express from "express";
import auth from "../middleware/auth.js";

import {
  createLaporan,
  getAllLaporan,
  getAllLaporanAdmin,
  updateStatusLaporan,
  getLaporanById,
} from "../controllers/laporanController.js";

const router = express.Router();

// USER
router.get("/laporan", auth, getAllLaporan);


// ADMIN
router.get("/laporan/admin", auth, getAllLaporanAdmin);

// DETAIL (FIX 1 SAJA)
router.get("/laporan/:id", auth, getLaporanById);

// UPDATE STATUS (FIX 2)
router.put("/laporan/:id/status", auth, updateStatusLaporan);

export default router;