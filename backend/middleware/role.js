export default function role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userRole = (req.user.role || "").toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        msg: "Akses ditolak",
        yourRole: userRole,
      });
    }

    next();
  };
}