import Comment from '../models/comment.js';

export const addComment = async (req, res) => {
  const { laporan_id, komentar } = req.body;
  if (!laporan_id || !komentar) {
    return res.status(400).json({ msg: 'Laporan ID dan komentar wajib diisi' });
  }
  try {
    const result = await Comment.create(laporan_id, req.user.id, komentar);
    res.status(201).json({ msg: 'Komentar ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    await Comment.delete(id, req.user.id, req.user.role);
    res.json({ msg: 'Komentar dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};