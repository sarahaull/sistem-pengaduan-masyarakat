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
      "SELECT id, nama, email, role, foto FROM users WHERE id = ?",
      [id]
    );

    return rows[0];
  },

  update: async (id, data) => {
    const nama = data.nama ?? null;
    const email = data.email ?? null;
    const foto = data.foto ?? null;

    const [result] = await db.execute(
      `UPDATE users 
       SET 
         nama = COALESCE(?, nama),
         email = COALESCE(?, email),
         foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nama, email, foto, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await db.execute(
      `SELECT id, nama, email, role, foto
       FROM users
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  
};

export default User;