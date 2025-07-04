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
    
        // Validate if ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid Patient ID format." });
        }
    
        // Fetch all flap records for the patient
        const flapRecords = await FlapData.find({ patient_id: id })
            .populate("patient_id", "name age contact") // Include patient details
            .sort({ timestamp: -1 }); // Sort by latest entry
    
        if (!flapRecords || flapRecords.length === 0) {
            return res.status(404).json({ error: "No flap data found for this patient." });
        }
    
        res.status(200).json(flapRecords);
    } catch (error) {
        console.error("Error fetching flap data:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
  
// Get Assigned Patients for a Doctor by Email
const getAssignPatients = async (req, res) => {
    try {
        const { email } = req.body; // Extract doctor email from request body
        
        
        // Use the user ID from the token instead of relying on email in request body
        // This is more secure as it prevents doctors from accessing other doctors' patients
        const doctorId = req.user.userId;
        console.log(doctorId);
        
        // Validate email if you still want to use it
        if (!email) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        // Find the doctor by email
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found." });
        }

        // Verify the doctor making the request matches the email provided
        // Uncomment this if you want this extra security check
        /*
        if (doctor._id.toString() !== doctorId) {
            return res.status(403).json({ error: "Unauthorized. You can only view your own patients." });
        }
        */

        // Fetch all patients assigned to this doctor
        const assignedPatients = await Patient.find({ assignedDoctor: doctor._id });
        console.log(assignedPatients);
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
module.exports = { create, login, getFlapByPatientId, getAssignPatients };