const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { error } = require("console");
const REACT_URL = process.env.REACT_APP_URL || "http://localhost:3000";
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ========================== FORGOT PASSWORD ==========================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Bypass SSL verification
    },
  });

  const resetURL = `${REACT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: user.email,
    subject: "Password Reset Request",
    text: `Click the link to reset your password: ${resetURL}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Email sending failed", error });
    }
    res.json({ success: true, message: "Email sent successfully!" });
  });
});

// ========================== RESET PASSWORD ==========================
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find user with the given reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// ========================== SIGNUP ==========================
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&#]/)
      .withMessage("Password must contain at least one special character"),
    body("role")
      .isIn(["doctor", "patient", "hospital"])
      .withMessage("Invalid role"),
    body("telephone")
      .matches(/^\d{10}$/)
      .withMessage("Telephone must be 10 digits"),
    body("nic")
      .optional({ checkFalsy: true })
      .notEmpty()
      .withMessage("National Identity Number is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let {
      name,
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth,
      telephone,
      nic,
      title,
      speciality,
      address,
      registrationNumber,
    } = req.body;

    email = email.toLowerCase();

    const models = {
      doctor: Doctor,
      patient: Patient,
    };

    try {
      let userExists = await User.findOne({ email });

      if (userExists) {
        return res
          .status(400)
          .json({ success: false, error: "User already exists" });
      }

      const Model = models[role];
      registerUser = await Model.findOne({ email });

      if (!registerUser) {
        return res
          .status(400)
          .json({ success: false, error: "User not registered" });
      }

      if (role === "doctor") registerUser = await Doctor.findOne({ email });

      if ((role === "doctor" || role === "patient") && !nic) {
        return res
          .status(400)
          .json({ success: false, error: "NIC is required for this role" });
      }

      if (!name && (role === "doctor" || role === "patient")) {
        name = `${firstName} ${lastName}`;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        telephone,
      };

      if (nic) userData.nic = nic;

      if (role === "patient") {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.dateOfBirth = dateOfBirth;
      } else if (role === "doctor") {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.title = title;
        userData.speciality = speciality;
      } else if (role === "hospital") {
        userData.address = address;
        userData.registrationNumber = registrationNumber;
      }

      const user = new User(userData);
      await user.save();

      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Signup Error:", err);
      res
        .status(500)
        .json({ success: false, errors: "Server Error", error: err.message });
    }
  }
);

// ========================== SIGNIN ==========================
router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let { email, password } = req.body;
    email = email.toLowerCase();

    try {
      let user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Signin Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  }
);

module.exports = router;
