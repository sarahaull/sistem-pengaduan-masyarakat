import db from "../config/db.js";

const Chat = {
  getByLaporanId: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM chat WHERE laporan_id = ? ORDER BY created_at ASC`,
      [id]
    );
    return rows;
  },

  create: async (laporan_id, user_id, sender, message) => {
    const [result] = await db.query(
      `INSERT INTO chat (laporan_id, user_id, sender, message)
       VALUES (?, ?, ?, ?)`,
      [laporan_id, user_id, sender, message]
    );

    const [rows] = await db.query(
      `SELECT * FROM chat WHERE id = ?`,
      [result.insertId]
    );

    return rows[0];
  },
};

export default Chat;