// middleware/isSuperAdmin.js
export default function isSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ msg: "Akses ditolak. Hanya Super Admin." });
  }
  next();
}