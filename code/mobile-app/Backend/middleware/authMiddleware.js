// authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        // Get authorization header (Express automatically lowercases header names)
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token, authorization denied",
                success: false
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                message: "No token provided",
                success: false
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
        
        // Add user info to request object
        req.user = decoded;
        console.log("Decoded user:", req.user);
        
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired",
                success: false
            });
        } else {
            return res.status(401).json({
                message: "Token verification failed",
                success: false
            });
        }
    }
};

module.exports = { verifyToken };