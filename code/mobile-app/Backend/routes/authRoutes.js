const express = require("express");
const { create, login } = require("../controller/userController");
const { forgotPassword, resetPassword } = require("../controller/passwordController");

const router = express.Router();

// Authentication routes
router.post("/signup", create);
router.post("/login", login);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;