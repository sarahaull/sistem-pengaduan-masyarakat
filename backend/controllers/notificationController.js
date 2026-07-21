import db from "../config/db.js";

// GET NOTIFICATIONS
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT id, message, is_read, created_at 
       FROM notifications 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = ?`,
      [userId]
    );

    res.json({ message: "Semua notifikasi dibaca" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update notifikasi" });
  }
};

// CREATE NOTIF (dipakai chat)
export const createNotification = async (user_id, laporan_id, type, message) => {
  try {
    console.log("CREATE NOTIF:", { user_id, laporan_id, type, message });

    const [result] = await db.query(
      `INSERT INTO notifications (user_id, laporan_id, type, message)
       VALUES (?, ?, ?, ?)`,
      [user_id, laporan_id, type, message]
    );

    console.log("NOTIF SUCCESS");
    return result;

  } catch (err) {
    console.log("NOTIF ERROR:", err);
  }
};