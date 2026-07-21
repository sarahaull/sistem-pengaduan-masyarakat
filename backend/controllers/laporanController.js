import { io } from "../app.js";
import db from "../config/db.js";
import Laporan from "../models/Laporan.js";
import Comment from "../models/comment.js";
import Category from "../models/category.js";
import { createNotification } from "./notificationController.js";


// ================= CREATE LAPORAN =================
export const createLaporan = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
  judul,
  deskripsi,
  kategori_id,
  alamat,
  latitude,
  longitude,
} = req.body;

console.log("ALAMAT MASUK:", alamat);
console.log("LAT:", latitude);
console.log("LNG:", longitude);

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
  kategori_id && kategori_id !== "null"
  ? Number(kategori_id)
  : null,
  foto,
  alamat,
  latitude,
  longitude
);

    io.emit("laporanBaru", {
  pesan: `Laporan baru: ${judul}`,
  laporanId: result.insertId,
});

res.status(201).json({
  msg: "Laporan berhasil dibuat",
  id: result.insertId,
});

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ================= GET USER LAPORAN =================
export const getAllLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        laporan.id,
        laporan.judul,
        laporan.deskripsi,
        laporan.foto,
        laporan.status,
        laporan.created_at,
        laporan.alamat,
        laporan.latitude,
        laporan.longitude,
        laporan.kategori_id,
        categories.nama AS kategori
      FROM laporan
      LEFT JOIN categories ON laporan.kategori_id = categories.id
      WHERE laporan.user_id = ?
      ORDER BY laporan.created_at DESC
    `, [req.user.id]);

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

    const id = req.params.id;

    await Laporan.updateStatus(id, status);

    // ambil laporan dulu (untuk user_id + judul)
    const laporan = await Laporan.findById(id);

    await createNotification(
      laporan.user_id,
      id,
      "status",
      `Laporan "${laporan.judul}" diubah menjadi ${status}`
    );

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
    console.log("BODY UPDATE:", req.body);
    console.log("FILE UPDATE:", req.file);

    const { id } = req.params;

    const judul = req.body?.judul;
    const deskripsi = req.body?.deskripsi;
    let kategori_id = req.body?.kategori_id;

// convert "null" / "" jadi NULL asli
if (!kategori_id || kategori_id === "null") {
  kategori_id = null;
} else {
  kategori_id = Number(kategori_id);
}
    const alamat = req.body?.alamat;
    const latitude = req.body?.latitude;
const longitude = req.body?.longitude;

    if (!judul || !deskripsi) {
      return res.status(400).json({
        msg: "Judul dan deskripsi wajib diisi",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM laporan WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    const laporan = rows[0];

    if (!laporan) {
      return res.status(404).json({
        msg: "Laporan tidak ditemukan",
      });
    }

    if (laporan.status !== "pending") {
      return res.status(403).json({
        msg: "Laporan tidak bisa diubah karena sudah diproses admin",
      });
    }

    let foto = laporan.foto;

    if (req.file) {
      foto = req.file.filename;
    }

    console.log({
  judul,
  deskripsi,
  kategori_id,
  alamat,
  foto,
  id,
  user_id: req.user?.id,
});

    await db.query(
  `UPDATE laporan
   SET judul=?,
       deskripsi=?,
       kategori_id=?,
       foto=?,
       alamat=?,
       latitude=?,
       longitude=?
   WHERE id=? AND user_id=?`,
 [
  judul,
  deskripsi,
  kategori_id,
  foto,
  alamat,
  latitude,
  longitude,
  id,
  req.user.id,
]
);

    res.json({
      msg: "Laporan berhasil diupdate",
    });
  } catch (err) {
  console.error("UPDATE ERROR:", err);

  res.status(500).json({
    msg: err.message,
  });
}
};