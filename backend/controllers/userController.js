import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    const userExist = await User.findByEmail(email);

    if (userExist) {
      return res.status(400).json({
        msg: "Email sudah digunakan",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create(nama, email, hashPassword, "user");

    res.status(201).json({
      msg: "Register berhasil",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Password salah" });
    }

    const role = (user.role || "").toLowerCase();

    const token = jwt.sign(
      {
        id: user.id,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ HANYA 1 RESPONSE (INI FIX PENTING)
    return res.status(200).json({
      msg: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role,
      },
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
};

// ================= PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    res.json({
      id: user.id,
      nama: user.nama,
      email: user.email,
      no_telepon: user.no_telepon || "",
      foto: user.foto || null,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email, no_telepon } = req.body;

    const updated = await User.update(userId, {
      nama,
      email,
      no_telepon,
    });

    res.json({
      msg: "Profile berhasil diupdate",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // atau query kamu

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal ambil users",
    });
  }
};



// ================= UPLOAD FOTO PROFILE =================
export const uploadFotoProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        msg: "File foto tidak ditemukan",
      });
    }

    // nama file dari multer
    const foto = req.file.filename;

    // update foto user di database
    await User.updateFoto(userId, foto);

    // ambil user terbaru
    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      msg: "Upload berhasil",
      foto: updatedUser.foto,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      msg: err.message,
    });
  }
};