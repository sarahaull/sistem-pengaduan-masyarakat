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

let laporan = [
  {
    id: 1,
    judul: "Lampu jalan mati",
    status: "pending",
    isRead: false,
  },
  {
    id: 2,
    judul: "Jalan rusak",
    status: "pending",
    isRead: false,
  },
];

export async function GET() {
  return Response.json(laporan);
}

export async function POST(req) {
  const body = await req.json();

  const newLaporan = {
    id: Date.now(),
    ...body,
    isRead: false,
  };

  laporan.push(newLaporan);

  return Response.json(newLaporan);
}

export default router;