import db from "../config/db.js";

export const getAllCommentsAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.komentar,
        c.created_at,
        c.user_id,
        c.laporan_id,
        c.parent_id,
        u.nama AS user_name,
        u.role AS user_role,
        l.judul AS laporan_judul,
        l.status AS laporan_status
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN laporan l ON c.laporan_id = l.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentar } = req.body;
    await db.query("UPDATE comments SET komentar = ? WHERE id = ?", [komentar, id]);
    res.json({ msg: "Komentar diupdate" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ msg: "Komentar dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const addReplyComment = async (req, res) => {
  try {
    const { laporan_id, komentar, parent_id } = req.body;
    const userId = req.user.id;
    if (!laporan_id || !komentar) {
      return res.status(400).json({ msg: "Laporan ID dan komentar wajib diisi" });
    }
    const [result] = await db.query(
      "INSERT INTO comments (laporan_id, user_id, komentar, parent_id) VALUES (?, ?, ?, ?)",
      [laporan_id, userId, komentar, parent_id || null]
    );
    res.status(201).json({ msg: "Balasan berhasil dikirim", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};