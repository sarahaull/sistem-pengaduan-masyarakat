import db from "../config/db.js";

// GET ALL
export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gagal ambil kategori" });
  }
};

// CREATE
export const createCategory = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    await db.query(
      "INSERT INTO categories (nama) VALUES (?)",
      [nama]
    );

    res.json({ message: "Kategori berhasil ditambahkan" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gagal tambah kategori" });
  }
};

// UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    await db.query(
      "UPDATE categories SET nama = ? WHERE id = ?",
      [nama, id]
    );

    res.json({ message: "Kategori berhasil diupdate" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gagal update kategori" });
  }
};

// DELETE
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gagal hapus kategori" });
  }
};