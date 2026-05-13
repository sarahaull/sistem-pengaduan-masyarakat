import db from "../config/db.js";

const Category = {
  findAll: async () => {
    const [rows] = await db.query(`
      SELECT id, nama 
      FROM categories
      ORDER BY id ASC
    `);

    return rows;
  },
};

export default Category;