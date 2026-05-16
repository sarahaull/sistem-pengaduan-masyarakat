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
    const [rows] = await db.query(`
      SELECT 
        id,
        nama AS name,
        email,
        role,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.log("GET USERS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
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

    const [user] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (err) {
    console.log("DELETE USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
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


// =========================
// CREATE USER
// =========================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    // cek email
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    await db.query(
      `
      INSERT INTO users (nama, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, password, role]
    );

    return res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
    });
  } catch (err) {
    console.log("CREATE USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// UPDATE USER
// =========================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, password, role } = req.body;

    // cek user
    const [user] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // update dengan password
    if (password) {
      await db.query(
        `
        UPDATE users
        SET nama=?, email=?, password=?, role=?
        WHERE id=?
        `,
        [name, email, password, role, id]
      );
    } else {
      await db.query(
        `
        UPDATE users
        SET nama=?, email=?, role=?
        WHERE id=?
        `,
        [name, email, role, id]
      );
    }

    return res.json({
      success: true,
      message: "User berhasil diupdate",
    });
  } catch (err) {
    console.log("UPDATE USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getAllLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM laporan ORDER BY created_at DESC
    `);

    res.json({
      laporan: rows,
    });
  } catch (err) {
    console.log("ERROR getAllLaporan:", err);
    res.status(500).json({
      msg: "Gagal mengambil semua laporan",
      error: err.message,
    });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        al.id,
        al.user_id,
        u.nama AS user_name,
        al.action,
        al.details,
        al.ip_address,
        al.created_at AS timestamp
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Gagal mengambil activity log" });
  }
};