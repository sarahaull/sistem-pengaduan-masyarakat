import express from "express";
import auth from "../middleware/auth.js";
import db from "../config/db.js";

const router = express.Router();

// GET ALL COMMENTS FOR ADMIN
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        c.id,
        c.komentar,
        c.created_at,
        c.laporan_id,
        u.nama as user_name,
        u.role as user_role,
        l.judul as laporan_judul,
        l.status as laporan_status
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN laporan l ON c.laporan_id = l.id
      ORDER BY c.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;