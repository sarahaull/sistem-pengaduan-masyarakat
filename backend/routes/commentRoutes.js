import express from "express";
import auth from "../middleware/auth.js";
import {
  addComment,
  deleteComment
} from "../controllers/commentController.js";

const router = express.Router();

// GET comments per laporan (INI YANG KURANG)
router.get("/", auth, async (req, res) => {
  try {
    const { laporan_id } = req.query;

    if (!laporan_id) {
      return res.status(400).json({ msg: "laporan_id wajib" });
    }

    const Comment = (await import("../models/comment.js")).default;

    const comments = await Comment.findByLaporanId(laporan_id);

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST comment
router.post("/", auth, addComment);

// DELETE comment
router.delete("/:id", auth, deleteComment);

export default router;