import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ msg: "Token tidak ada" });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token format salah" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ msg: "Token invalid" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      msg: "Token error / expired"
    });
  }
}