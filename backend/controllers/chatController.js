import Chat from "../models/chat.js";
import db from "../config/db.js"; 


export const getChat = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Chat.getByLaporanId(id);

    res.json(data || []);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

export const createChat = async (req, res) => {
  try {
    const { laporan_id, message } = req.body;
    const user_id = req.user.id;
    const role =
  req.user.role === "user"
    ? "user"
    : "admin"; // 🔥 penting

    if (!laporan_id || !message) {
      return res.status(400).json({ msg: "Data tidak lengkap" });
    }

    await db.query(
      `INSERT INTO chat (laporan_id, user_id, sender, message)
       VALUES (?, ?, ?, ?)`,
      [laporan_id, user_id, role, message] // 🔥 FIX DI SINI
    );

    res.json({ msg: "Chat berhasil dikirim" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

export const sendChat = async (req, res) => {
  try {
    const { laporan_id, message } = req.body;
    console.log("PANJANG PESAN:", message?.length);
console.log("AWAL PESAN:", message?.substring(0, 50));
    const user_id = req.user.id;
    const role = req.user.role === "user" ? "user" : "admin";

    // VALIDASI
    if (!laporan_id || !message) {
      return res.status(400).json({ msg: "Data tidak lengkap" });
    }

    // 1. INSERT CHAT
    await db.query(
      `INSERT INTO chat (laporan_id, user_id, sender, message)
       VALUES (?, ?, ?, ?)`,
      [laporan_id, user_id, role, message]
    );

    // 2. AMBIL USER PEMILIK LAPORAN
    const [laporan] = await db.query(
      `SELECT user_id FROM laporan WHERE id = ?`,
      [laporan_id]
    );

    if (!laporan.length) {
      return res.status(404).json({ msg: "Laporan tidak ditemukan" });
    }

    const targetUser = laporan[0].user_id;

    // 🔥 DEBUG LOG (INI YANG KAMU TANYA)
    console.log("NOTIF INSERT:", {
      user: targetUser,
      laporan_id,
      type: "chat",
      message: `Pesan baru pada laporan kamu`
    });

    // 3. INSERT NOTIFIKASI (FIXED SESUAI TABLE BARU)
    await db.query(
      `INSERT INTO notifications (user_id, laporan_id, type, message)
       VALUES (?, ?, ?, ?)`,
      [
        targetUser,
        laporan_id,
        "chat",
        `Pesan baru pada laporan kamu`
      ]
    );

    return res.json({
      msg: "Chat berhasil dikirim + notifikasi masuk"
    });

  } catch (err) {
    console.log("ERROR SEND CHAT:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};