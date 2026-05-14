import User from "../models/User.js";
import Laporan from "../models/Laporan.js";
import db from "../config/db.js";

/**
 * =========================
 * SUPER ADMIN DASHBOARD
 * =========================
 */
export const getSuperAdminDashboard = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const totalAdmin = await User.countDocuments({ role: "admin" });
    const totalSuperAdmin = await User.countDocuments({ role: "super_admin" });

    const totalLaporan = await Laporan.countDocuments();
    const laporanMasuk = await Laporan.countDocuments({ status: "menunggu" });
    const laporanDiproses = await Laporan.countDocuments({ status: "diproses" });
    const laporanSelesai = await Laporan.countDocuments({ status: "selesai" });

    res.json({
      success: true,
      data: {
        user: {
          totalUser,
          totalAdmin,
          totalSuperAdmin,
        },
        laporan: {
          totalLaporan,
          laporanMasuk,
          laporanDiproses,
          laporanSelesai,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil dashboard super admin",
      error: error.message,
    });
  }
};

/**
 * =========================
 * GET ALL USERS (ADMIN + USER)
 * =========================
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
};

/**
 * =========================
 * CREATE ADMIN
 * =========================
 */
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin berhasil dibuat",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal membuat admin",
      error: error.message,
    });
  }
};

/**
 * =========================
 * DELETE USER / ADMIN
 * =========================
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
};

/**
 * =========================
 * GET ALL LAPORAN (FULL ACCESS)
 * =========================
 */
export const getAllLaporanSuperAdmin = async (req, res) => {
  try {
    const laporan = await Laporan.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};


export const getSuperAdminStats = async (req, res) => {
  try {
    const [users] = await db.query("SELECT COUNT(*) as total FROM users");
    const [admin] = await db.query("SELECT COUNT(*) as total FROM users WHERE role='admin'");
    const [superadmin] = await db.query("SELECT COUNT(*) as total FROM users WHERE role='super_admin'");

    const [laporan] = await db.query("SELECT COUNT(*) as total FROM laporan");
    const [pending] = await db.query("SELECT COUNT(*) as total FROM laporan WHERE status='pending'");
    const [diproses] = await db.query("SELECT COUNT(*) as total FROM laporan WHERE status='diproses'");
    const [selesai] = await db.query("SELECT COUNT(*) as total FROM laporan WHERE status='selesai'");

    return res.json({
      totalUsers: users[0].total,
      totalAdmins: admin[0].total,
      totalSuperAdmins: superadmin[0].total,
      totalLaporan: laporan[0].total,
      totalPending: pending[0].total,
      totalDiproses: diproses[0].total,
      totalSelesai: selesai[0].total,
    });
  } catch (err) {
    console.log("STATS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getRecentUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nama AS name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
    );

    return res.json({
      success: true,
      data: rows || [],
    });
  } catch (err) {
    console.log("USERS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getRecentLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        laporan.id,
        laporan.judul,
        laporan.status,
        laporan.created_at,
        users.nama AS user_name
      FROM laporan
      LEFT JOIN users ON laporan.user_id = users.id
      ORDER BY laporan.created_at DESC
      LIMIT 5
    `);

    const formatted = rows.map((l) => ({
      id: l.id,
      judul: l.judul,
      status: l.status,
      user: {
        name: l.user_name || "-",
      },
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.log("LAPORAN ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};