// ===================================================
// accessControl.js - FIXED VERSION
// ===================================================

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // CRITICAL FIX: Check if req.user exists first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. User not found in request.",
      });
    }

    // Check if user has role property
    if (!req.user.role) {
      return res.status(401).json({
        success: false,
        message: "User role not found. Please login again.",
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }
    
    next();
  };
}

module.exports = requireRole;