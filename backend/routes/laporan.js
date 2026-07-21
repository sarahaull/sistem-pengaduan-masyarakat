import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
  createLaporan,
  getAllLaporan,
  getAllLaporanAdmin,
  getLaporanById,
  updateLaporan,
  deleteLaporan,
  getCategories,
  updateStatusLaporan
} from "../controllers/laporanController.js";

const router = express.Router();

/* =========================
   CATEGORY
========================= */
router.get("/categories", auth, getCategories);

/* =========================
   USER LAPORAN
========================= */
router.get("/laporan", auth, getAllLaporan);

router.post(
  "/laporan",
  auth,
  upload.single("foto"),
  createLaporan
);

/* =========================
   DETAIL LAPORAN
========================= */
router.get("/laporan/:id", auth, getLaporanById);

/* =========================
   ADMIN / ALL LAPORAN
========================= */
router.get("/laporan/admin", auth, getAllLaporanAdmin);

/* =========================
   UPDATE LAPORAN (USER)
========================= */
router.put(
  "/laporan/update/:id",
  auth,
  upload.single("foto"),
  updateLaporan
);

/* =========================
   DELETE LAPORAN
========================= */
router.delete(
  "/laporan/:id",
  auth,
  deleteLaporan
);

/* =========================
   UPDATE STATUS (ADMIN)
   + ini yang trigger NOTIF
========================= */
router.put(
  "/laporan/:id/status",
  auth,
  updateStatusLaporan
);

export default router;