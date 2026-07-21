import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.resolve("uploads");

// buat folder kalau belum ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// filter hanya gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File harus gambar"), false);
  }
};

// ✅ hanya SATU upload
const upload = multer({
  storage,
  fileFilter,
});

export default upload;