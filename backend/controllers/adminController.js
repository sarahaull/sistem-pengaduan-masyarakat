import db from "../config/db.js";
import bcrypt from "bcryptjs";

// ================= DASHBOARD =================
export const getDashboardAdmin = async (req, res) => {
  try {
    const [laporan] = await db.query(
      "SELECT COUNT(*) as total FROM laporan"
    );

    const [users] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role='user'"
    );

    const [diproses] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='diproses'"
    );

    const [selesai] = await db.query(
      "SELECT COUNT(*) as total FROM laporan WHERE status='selesai'"
    );

    const [latest] = await db.query(`
      SELECT 
        laporan.id,
        laporan.judul,
        laporan.status,
        laporan.created_at,
        users.nama as user_nama,
        categories.nama as kategori
      FROM laporan
      LEFT JOIN users ON laporan.user_id = users.id
      LEFT JOIN categories ON laporan.kategori_id = categories.id
      ORDER BY laporan.created_at DESC
    `);

    res.json({
      totalLaporan: laporan[0].total,
      totalUsers: users[0].total,
      totalDiproses: diproses[0].total,
      totalSelesai: selesai[0].total,
      laporanTerbaru: latest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= GET ADMIN PROFILE =================
// ================= ADMIN PROFILE =================
export const getAdminProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await db.query(
      "SELECT id, nama, email, no_telepon, foto, role FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "Admin tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= UPDATE ADMIN PROFILE =================
export const updateAdminProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { nama, email, no_telepon } = req.body;

    await db.query(
      "UPDATE users SET nama=?, email=?, no_telepon=? WHERE id=?",
      [nama, email, no_telepon, id]
    );

    res.json({ msg: "Profile berhasil diupdate" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= UPLOAD FOTO ADMIN =================
export const uploadAdminFoto = async (req, res) => {
  try {
    const id = req.user.id;
    const foto = req.file.filename;

    await db.query(
      "UPDATE users SET foto=? WHERE id=?",
      [foto, id]
    );

    res.json({
      msg: "Foto berhasil diupload",
      foto,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= CHANGE PASSWORD =================
export const changeAdminPassword = async (req, res) => {
  try {
    const id = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(
      currentPassword,
      rows[0].password
    );

    if (!match) {
      return res.status(400).json({ msg: "Password lama salah" });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=? WHERE id=?",
      [hash, id]
    );

    res.json({ msg: "Password berhasil diubah" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

