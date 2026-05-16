import db from "../config/db.js";

// GET ALL COMMENTS ADMIN
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.komentar,
        c.created_at,
        c.user_id,
        c.laporan_id,
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

// UPDATE COMMENT
export const updateCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentar } = req.body;

    await db.query(
      "UPDATE comments SET komentar = ? WHERE id = ?",
      [komentar, id]
    );

    res.json({ msg: "Komentar diupdate" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE COMMENT
export const deleteCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM comments WHERE id = ?", [id]);

    res.json({ msg: "Komentar dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};