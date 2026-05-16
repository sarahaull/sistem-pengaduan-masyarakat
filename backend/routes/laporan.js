import express from "express";
import auth from "../middleware/auth.js";

import {
  createLaporan,
  getAllLaporan,
  getAllLaporanAdmin,
  updateStatusLaporan,
  getLaporanById,
  updateLaporan,
  deleteLaporan
} from "../controllers/laporanController.js";

const router = express.Router();

// USER
router.get("/laporan", auth, getAllLaporan);
router.post("/laporan", auth, createLaporan);

// DETAIL
router.get("/laporan/admin", auth, getAllLaporanAdmin);
router.get("/laporan/:id", auth, getLaporanById);

// UPDATE + DELETE (USER)
router.put("/laporan/:id", auth, updateLaporan);
router.delete("/laporan/:id", auth, deleteLaporan);

// STATUS ADMIN
router.put("/laporan/:id/status", auth, updateStatusLaporan);

export default router;