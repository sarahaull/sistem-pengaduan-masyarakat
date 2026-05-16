import db from "../config/db.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; 

// =========================
// DASHBOARD ADMIN
// =========================
export const getDashboardAdmin = async (req, res) => {
  try {
    // Total laporan
    const [laporan] = await db.query(
      "SELECT COUNT(*) as total FROM laporan"
    );

    // Total user
    const [users] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role='user'"
    );

    // Total pending
    const [pending] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='pending'"
    );

    // Total diproses
    const [diproses] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='diproses'"
    );

    // Total selesai
    const [selesai] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='selesai'"
    );

    // Total ditolak
    const [ditolak] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='ditolak'"
    );

    // Data laporan terbaru
    const [latest] = await db.query(`
      SELECT 
        laporan.id,
        laporan.judul,
        laporan.deskripsi,
        laporan.foto,
        laporan.status,
        laporan.created_at,

        users.nama AS user_nama,
        users.email AS user_email,

        categories.nama AS kategori

      FROM laporan

      LEFT JOIN users 
      ON laporan.user_id = users.id

      LEFT JOIN categories 
      ON laporan.kategori_id = categories.id

      ORDER BY laporan.created_at DESC
    `);

    res.json({
      totalLaporan: laporan[0].total,
      totalUsers: users[0].total,
      totalPending: pending[0].total,
      totalDiproses: diproses[0].total,
      totalSelesai: selesai[0].total,
      totalDitolak: ditolak[0].total,
      laporanTerbaru: latest,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// =========================
// GET ADMIN PROFILE
// =========================
export const getAdminProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        id,
        nama,
        email,
        no_telepon,
        foto,
        role,
        created_at
      FROM users
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Admin tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// =========================
// UPDATE ADMIN PROFILE
// =========================
export const updateAdminProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const {
      nama,
      email,
      no_telepon,
    } = req.body;

    // Validasi
    if (!nama || !email) {
      return res.status(400).json({
        msg: "Nama dan email wajib diisi",
      });
    }

    // Cek email dipakai user lain
    const [checkEmail] = await db.query(
      `
      SELECT id FROM users
      WHERE email = ?
      AND id != ?
      `,
      [email, id]
    );

    if (checkEmail.length > 0) {
      return res.status(400).json({
        msg: "Email sudah digunakan",
      });
    }

    await db.query(
      `
      UPDATE users
      SET 
        nama = ?,
        email = ?,
        no_telepon = ?
      WHERE id = ?
      `,
      [
        nama,
        email,
        no_telepon,
        id,
      ]
    );

    // Ambil data terbaru
    const [updated] = await db.query(
      `
      SELECT 
        id,
        nama,
        email,
        no_telepon,
        foto,
        role
      FROM users
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      msg: "Profile berhasil diupdate",
      admin: updated[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// =========================
// UPLOAD FOTO ADMIN
// =========================
export const uploadAdminFoto = async (req, res) => {
  try {
    const id = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        msg: "Foto wajib dipilih",
      });
    }

    const foto = req.file.filename;

    await db.query(
      `
      UPDATE users
      SET foto = ?
      WHERE id = ?
      `,
      [foto, id]
    );

    res.json({
      msg: "Foto berhasil diupload",
      foto,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Upload foto gagal",
    });
  }
};

// =========================
// CHANGE PASSWORD ADMIN
// =========================
export const changeAdminPassword = async (
  req,
  res
) => {
  try {
    const id = req.user.id;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    // Validasi
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        msg: "Semua field wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "Password minimal 6 karakter",
      });
    }

    // Ambil password lama
    const [rows] = await db.query(
      `
      SELECT password
      FROM users
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Admin tidak ditemukan",
      });
    }

    // Cocokkan password lama
    const match = await bcrypt.compare(
      currentPassword,
      rows[0].password
    );

    if (!match) {
      return res.status(400).json({
        msg: "Password lama salah",
      });
    }

    // Hash password baru
    const hash = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hash, id]
    );

    res.json({
      msg: "Password berhasil diubah",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

// =========================
// GET LAPORAN ADMIN
// =========================
// =========================
// GET LAPORAN ADMIN
// =========================
export const getAdminLaporan = async (req, res) => {
  try {
    const [laporan] = await db.query(`
      SELECT 
        laporan.id,
        laporan.judul,
        laporan.deskripsi,
        laporan.foto,
        laporan.status,
        laporan.created_at,

        users.nama AS nama_user,
        users.email AS email,

        categories.nama AS kategori

      FROM laporan

      LEFT JOIN users
      ON laporan.user_id = users.id

      LEFT JOIN categories
      ON laporan.kategori_id = categories.id

      ORDER BY laporan.created_at DESC
    `);

    res.json(laporan);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {

    const [users] = await db.query(`
      SELECT 
        id,
        nama AS name,
        email,
        role,
        created_at
      FROM users
    `);

    res.status(200).json(users);

  } catch (error) {

    console.log("ERROR GET USERS:", error);

    res.status(500).json({
      message: "Gagal mengambil users",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ msg: "User berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    await db.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    res.json({ msg: "Role berhasil diupdate" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteLaporanAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // cek laporan ada atau tidak
    const [rows] = await db.query(
      "SELECT * FROM laporan WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Laporan tidak ditemukan",
      });
    }

    // hapus komentar dulu kalau ada foreign key
    await db.query(
      "DELETE FROM comments WHERE laporan_id = ?",
      [id]
    );

    // hapus laporan
    await db.query(
      "DELETE FROM laporan WHERE id = ?",
      [id]
    );

    res.json({
      msg: "Laporan berhasil dihapus admin",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};