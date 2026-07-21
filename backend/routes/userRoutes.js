import express from "express";
import multer from "multer";
import path from "path";

import auth from "../middleware/auth.js";
import User from "../models/user.js";

import {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();


// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


// ================= AUTH =================
router.post("/register", register);

router.post("/login", login);


// ================= PROFILE =================
router.get("/profile", auth, getProfile);

router.put("/profile", auth, updateProfile);


// ================= USERS =================
router.get("/", auth, getAllUsers);


// ================= UPLOAD FOTO =================
// ================= UPLOAD FOTO =================
router.post(
  "/upload-foto",
  auth,
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          msg: "Tidak ada file",
        });
      }

      const foto = req.file.filename;

      // update foto user di database
      await User.update(req.user.id, {
        foto,
      });

      // ambil user terbaru
      const updatedUser = await User.findById(req.user.id);

      return res.status(200).json({
        msg: "Upload berhasil",
        foto: updatedUser.foto,
        user: updatedUser,
      });

    } catch (err) {
      console.log("UPLOAD ERROR:", err);

      return res.status(500).json({
        msg: err.message,
      });
    }
  }
);



export default router;