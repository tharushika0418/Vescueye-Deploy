// authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Invalid token." });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Insufficient permissions.",
    });
  }

  next();
};

module.exports = { verifyToken, checkRole };
