import express from "express";

import {
  createLaporan,
  getAllLaporan,
  getLaporanById,
  updateStatusLaporan,
  deleteLaporan,
  getCategories,
} from "../controllers/laporanController.js";


import verifyToken from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/laporan",
  verifyToken,
  upload.single("foto"),
  createLaporan
);

router.get(
  "/laporan",
  verifyToken,
  getAllLaporan
);

router.get(
  "/laporan/:id",
  verifyToken,
  getLaporanById
);

router.patch(
  "/laporan/:id/status",
  verifyToken,
  updateStatusLaporan
);

router.delete(
  "/laporan/:id",
  verifyToken,
  deleteLaporan
);

router.get(
  "/categories",
  verifyToken,
  getCategories
);

export default router;