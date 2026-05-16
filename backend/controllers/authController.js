import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';
import db from "../config/db.js";
dotenv.config();

export const register = async (req, res) => {
  const { nama, email, password, role } = req.body;
  // Validasi sederhana
  if (!nama || !email || !password) {
    return res.status(400).json({ msg: 'Semua field harus diisi' });
  }
  try {
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ msg: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create(nama, email, hashed, role || 'user');
    res.status(201).json({ msg: 'Registrasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Email tidak terdaftar' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // kirim format yang sesuai frontend kamu
    res.json({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      no_telepon: user.no_telepon || "",
      foto: user.foto || null,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};





