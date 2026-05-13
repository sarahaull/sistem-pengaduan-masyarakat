import db from "../config/db.js";

const Laporan = {
  // =========================
  // CREATE LAPORAN
  // =========================
  create: async (
    user_id,
    judul,
    deskripsi,
    kategori_id,
    foto
  ) => {
    const [result] = await db.query(
      `
      INSERT INTO laporan
      (user_id, judul, deskripsi, kategori_id, foto, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        judul,
        deskripsi,
        kategori_id,
        foto,
        "pending",
      ]
    );

    return result;
  },

  // =========================
  // GET ALL LAPORAN
  // =========================
  findAll: async () => {
    const [rows] = await db.query(`
      SELECT
        laporan.id,
        laporan.judul,
        laporan.deskripsi,
        laporan.foto,
        laporan.status,
        laporan.created_at,

        users.nama AS nama_user,
        users.email,

        categories.nama AS kategori

      FROM laporan

      LEFT JOIN users
      ON laporan.user_id = users.id

      LEFT JOIN categories
      ON laporan.kategori_id = categories.id

      ORDER BY laporan.created_at DESC
    `);

    return rows;
  },

  // =========================
  // UPDATE STATUS
  // =========================
  updateStatus: async (
    id,
    status
  ) => {
    await db.query(
      `
      UPDATE laporan
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );
  },

  // =========================
  // GET DETAIL LAPORAN
  // =========================
  findById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT
        laporan.id,
        laporan.judul,
        laporan.deskripsi,
        laporan.foto,
        laporan.status,
        laporan.created_at,

        users.nama AS nama_user,
        users.email,

        categories.nama AS kategori

      FROM laporan

      LEFT JOIN users
      ON laporan.user_id = users.id

      LEFT JOIN categories
      ON laporan.kategori_id = categories.id

      WHERE laporan.id = ?
      `,
      [id]
    );

    return rows[0];
  },
};

export default Laporan;