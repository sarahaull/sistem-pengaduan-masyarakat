import db from '../config/db.js';

const Comment = {
  create: async (laporanId, userId, komentar) => {
    const [result] = await db.execute(
      'INSERT INTO comments (laporan_id, user_id, komentar) VALUES (?, ?, ?)',
      [laporanId, userId, komentar]
    );
    return result;
  },
  findByLaporanId: async (laporanId) => {
    const [rows] = await db.execute(`
      SELECT c.*, u.nama as user_nama, u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.laporan_id = ?
      ORDER BY c.created_at ASC
    `, [laporanId]);
    return rows;
  },
  delete: async (id, userId, role) => {
    let query = 'DELETE FROM comments WHERE id = ?';
    let params = [id];
    if (role !== 'super_admin') {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    const [result] = await db.execute(query, params);
    return result;
  }
};
export default Comment;