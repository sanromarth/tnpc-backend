const verifyToken = require("./authMiddleware");
function requireAdmin(req, res, next) {
    verifyToken(req, res, (err) => {
        if (err) return; 
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    });
}

module.exports = requireAdmin;
