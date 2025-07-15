/*require("dotenv").config();  // Load environment variables

const User = require("../models/User");
const FlapData = require("../models/FlapData");
const bcrypt = require("bcryptjs");  // For password hashing
const jwt = require("jsonwebtoken"); // For JWT authentication

const JWT_SECRET = process.env.JWT_SECRET;  // Get JWT secret from environment variables

// User registration function
const create = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // Check if the user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user with hashed password
        const user = new User({ full_name, email, password: hashedPassword, role });
        const saveData = await user.save();

        res.status(201).json({ message: "User registered successfully", user: saveData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User login function (Restricted to doctors only)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Restrict login to only doctors
        if (user.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Only doctors can log in." });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,  
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Flap Data by Patient ID
const getFlapByPatientId = async (req, res) => {
    try {
      const { id } = req.params; // Extract patient ID from request parameters
  
      // Validate if ID is a valid MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid Patient ID format." });
      }
  
      // Fetch all flap records for the patient
      const flapRecords = await FlapData.find({ patient_id: id })
        .populate("patient_id", "name age contact") // Include patient details
        .sort({ timestamp: -1 }) // Sort by latest entry
  
      if (!flapRecords || flapRecords.length === 0) {
        return res.status(404).json({ error: "No flap data found for this patient." });
      }
  
      res.status(200).json(flapRecords);
    } catch (error) {
      console.error("Error fetching flap data:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  };
  const Doctor = require("../models/Doctor");
  const Patient = require("../models/Patient");
  
  // Get Assigned Patients for a Doctor by Email
  const getAssignPatients = async (req, res) => {
      try {
          const { email } = req.body; // Extract doctor email from request body
  
          // Validate email
          if (!email) {
              return res.status(400).json({ error: "Doctor email is required." });
          }
  
          // Find the doctor by email
          const doctor = await Doctor.findOne({ email });
          if (!doctor) {
              return res.status(404).json({ error: "Doctor not found." });
          }
  
          // Fetch all patients assigned to this doctor
          const assignedPatients = await Patient.find({ assignedDoctor: doctor._id });
  
          if (!assignedPatients || assignedPatients.length === 0) {
              return res.status(404).json({ error: "No assigned patients found for this doctor." });
          }
  
          res.status(200).json(assignedPatients);
      } catch (error) {
          console.error("Error fetching assigned patients:", error);
          res.status(500).json({ error: "Server error", details: error.message });
      }
  };
  
  

  
  

// Export using CommonJS
module.exports = { create, login ,getFlapByPatientId,getAssignPatients};
*/
require("dotenv").config();  // Load environment variables

const User = require("../models/User");
const FlapData = require("../models/FlapData");
const bcrypt = require("bcryptjs");  // For password hashing
const jwt = require("jsonwebtoken"); // For JWT authentication
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const JWT_SECRET = process.env.JWT_SECRET;  // Get JWT secret from environment variables

// User registration function
const create = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // Check if the user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user with hashed password
        const user = new User({ full_name, email, password: hashedPassword, role });
        const saveData = await user.save();

        res.status(201).json({ message: "User registered successfully", user: saveData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User login function (Restricted to doctors only)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Restrict login to only doctors
        if (user.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Only doctors can log in." });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token with longer expiration (24 hours instead of 1 hour)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,  
            { expiresIn: "24h" }  // Changed from 1h to 24h
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Flap Data by Patient ID
const getFlapByPatientId = async (req, res) => {
    try {
        const { id } = req.params; // Extract patient ID from request parameters
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1; // Page number (default 1)
        const limit = parseInt(req.query.limit) || 10; // Items per page (default 10)
        const skip = (page - 1) * limit;
        
        // Validate if ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid Patient ID format." });
        }
        
        // DEBUG: Check if any flap data exists for this patient
const flapCount = await FlapData.countDocuments({ patient_id: id });
console.log("Total flap records for patient:", flapCount);

// Fetch flap records - SIMPLIFIED without population first
const flapRecords = await FlapData.find({ patient_id: id })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

console.log("Fetched flap records:", flapRecords.length);
        
        // Count total records for frontend pagination
        const total = await FlapData.countDocuments({ patient_id: id });
        
        if (!flapRecords || flapRecords.length === 0) {
            return res.status(404).json({ error: "No flap data found for this patient." });
        }
        
        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            records: flapRecords,
        });
    } catch (error) {
        console.error("Error fetching flap data:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
  

const getAssignPatients = async (req, res) => {
    try {
        // Get user from JWT token
        const loggedInUserId = req.user.userId;
        const user = await User.findById(loggedInUserId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Use the user's email (same as web app logic)
        const email = user.email;
        console.log("Using email from JWT user:", email);

        // Check if the doctor exists (EXACT same logic as web app)
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        // Find all patients assigned to this doctor (EXACT same logic as web app)
        const assignedPatients = await Patient.find({ assignedDoctor: doctor._id });

        res.status(200).json(assignedPatients);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};


// Export using CommonJS
module.exports = { create, login, getFlapByPatientId, getAssignPatients };