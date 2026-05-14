import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: (decoded.role || "").toLowerCase(), // 🔥 FIX
    };

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
}