import db from "../config/db.js";

const User = {
  create: async (nama, email, password, role = "user") => {
    const [result] = await db.execute(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, password, role]
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute(
      "SELECT id, nama, email, role FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const { nama, email, no_telepon } = data;

    const [result] = await db.execute(
      `UPDATE users 
       SET nama = ?, email = ?, no_telepon = ? 
       WHERE id = ?`,
      [nama, email, no_telepon, id]
    );

    if (result.affectedRows === 0) return null;

    const [rows] = await db.execute(
      `SELECT id, nama, email, no_telepon, role 
       FROM users 
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  },
};

export default User;