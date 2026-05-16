import db from "../config/db.js";
import Laporan from "../models/laporan.js";
import Comment from "../models/comment.js";
import Category from "../models/category.js";


// ================= CREATE LAPORAN =================
export const createLaporan = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { judul, deskripsi, kategori_id } = req.body;

    if (!judul || !deskripsi) {
      return res.status(400).json({
        msg: "Judul dan deskripsi wajib diisi",
      });
    }

    const foto = req.file ? req.file.filename : null;

    const result = await Laporan.create(
      req.user.id,
      judul,
      deskripsi,
      kategori_id || null,
      foto
    );

    res.status(201).json({
      msg: "Laporan berhasil dibuat",
      id: result.insertId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
};


// ================= GET USER LAPORAN =================
export const getAllLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM laporan WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= ADMIN LAPORAN =================
export const getAllLaporanAdmin = async (req, res) => {
  try {
    const rows = await Laporan.findAll();
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= DETAIL =================
export const getLaporanById = async (req, res) => {
  try {
    const laporan = await Laporan.findById(req.params.id);

    if (!laporan) {
      return res.status(404).json({
        msg: "Laporan tidak ditemukan",
      });
    }

    const komentar = await Comment.findByLaporanId(req.params.id);

    res.json({
      ...laporan,
      komentar,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= UPDATE STATUS =================
export const updateStatusLaporan = async (req, res) => {
  try {
    const { status } = req.body;

    await Laporan.updateStatus(req.params.id, status);

    res.json({ msg: "Status berhasil diubah" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= DELETE =================
export const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM laporan WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    const laporan = rows[0];

    if (!laporan) {
      return res.status(404).json({ msg: "Laporan tidak ditemukan" });
    }

    // 🔥 BLOCK JIKA SUDAH DIPROSES
    if (laporan.status !== "pending") {
      return res.status(403).json({
        msg: "Laporan tidak bisa dihapus karena sudah diproses admin",
      });
    }

    await db.query("DELETE FROM laporan WHERE id = ?", [id]);

    res.json({ msg: "Laporan dihapus" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= CATEGORY =================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi } = req.body;

    // ambil laporan dulu
    const [rows] = await db.query(
      "SELECT * FROM laporan WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    const laporan = rows[0];

    if (!laporan) {
      return res.status(404).json({ msg: "Laporan tidak ditemukan" });
    }

    // 🔥 BLOCK JIKA SUDAH DIPROSES
    if (laporan.status !== "pending") {
      return res.status(403).json({
        msg: "Laporan tidak bisa diubah karena sudah diproses admin",
      });
    }

    await db.query(
      "UPDATE laporan SET judul=?, deskripsi=? WHERE id=? AND user_id=?",
      [judul, deskripsi, id, req.user.id]
    );

    res.json({ msg: "Laporan berhasil diupdate" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};