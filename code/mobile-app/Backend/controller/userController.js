const User = require("../models/User");
const Patient = require("../models/Patient.js");
const Doctor = require("../models/Doctor.js");
const FlapData = require("../models/FlapData.js");
const bcrypt = require("bcryptjs"); // Add this for password hashing
const jwt = require("jsonwebtoken"); // Add this for JWT tokens

// Authentication Functions
// Create user (signup)
exports.create = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email or username already exists" 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error creating user", 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    if(user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only doctors can log in."
      });}

    // For doctors, get the doctor profile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ email: user.email });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found"
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" }
    );

    // Prepare response data
    const responseData = {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    // Add doctor ID to response if user is a doctor
    if (user.role === 'doctor') {
      responseData.doctorId = doctorProfile._id;
      responseData.doctorInfo = {
        name: doctorProfile.name,
        specialty: doctorProfile.specialty
      };
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error during login", 
      error: error.message 
    });
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Fetch from Doctor model
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find(); // Fetch from Patient model
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get a specific patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
    }).select("-password");
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

//Register patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, age, address, contact, medicalHistory, gender } = req.body;

    // Validate contact number (must be 10 digits)
    if (!/^\d{10}$/.test(contact)) {
      return res
        .status(400)
        .json({ message: "Contact number must be exactly 10 digits" });
    }

    // Create new patient
    const newPatient = new Patient({
      name,
      age,
      address,
      contact,
      medicalHistory,
      gender,
    });

    // Save to database
    await newPatient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      patient: newPatient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering patient", error: error.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, specialty, contact, age } = req.body;

    // Validate all required fields
    if (!name || !email || !specialty || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate contact number (must be 10 digits)
    if (!/^\d{10}$/.test(contact)) {
      return res
        .status(400)
        .json({ message: "Contact number must be exactly 10 digits" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res
        .status(400)
        .json({ message: "Doctor with this email already exists" });
    }

    // Create new doctor
    const newDoctor = new Doctor({ name, email, specialty, contact, age });

    // Save to database
    await newDoctor.save();

    res
      .status(201)
      .json({ message: "Doctor registered successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res
      .status(500)
      .json({ message: "Error registering doctor", error: error.message });
  }
};

exports.assignPatientToDoctor = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    // Find Patient & Doctor
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ error: "Patient or Doctor not found" });
    }

    // Update Patient's assignedDoctor field
    patient.assignedDoctor = doctorId;

    // Add Patient to Doctor's assignedPatients array (if not already assigned)
    if (!doctor.assignedPatients.includes(patientId)) {
      doctor.assignedPatients.push(patientId);
    }

    await patient.save();
    await doctor.save();

    res
      .status(200)
      .json({ message: "Patient assigned to doctor successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    // Search patients by name or contact
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive name search
        { contact: { $regex: query, $options: "i" } }, // Case-insensitive contact search
      ],
    });

    res.status(200).json(patients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching patients", error: error.message });
  }
};

exports.searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    // Search doctors by name or contact or email
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive name search
        { contact: { $regex: query, $options: "i" } }, // Case-insensitive contact search
        { email: { $regex: query, $options: "i" } }, // Case-insensitive email search
      ],
    });

    res.status(200).json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching doctors", error: error.message });
  }
};

// Get all patients assigned to a specific doctor by name
// userController.js - FIXED getAssignPatients function
exports.getAssignPatients = async (req, res) => {
  try {
    console.log("=== getAssignPatients Debug Info ===");
    
    // Get the logged-in user's info from JWT token (set by verifyToken middleware)
    const { email, role, userId } = req.user;
    console.log("Logged in user:", { email, role, userId });

    // Verify this is a doctor
    if (role !== 'doctor') {
      console.log("Access denied - not a doctor");
      return res.status(403).json({ 
        success: false,
        error: "Access denied. Only doctors can view assigned patients." 
      });
    }

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    console.log("Doctor found:", doctor ? "Yes" : "No");
    
    if (!doctor) {
      console.log("Doctor not found in database");
      return res.status(404).json({ 
        success: false,
        error: "Doctor profile not found. Please contact administrator." 
      });
    }

    console.log("Doctor ID:", doctor._id);

    // Find all patients assigned to this doctor
    const assignedPatients = await Patient.find({ 
      assignedDoctor: doctor._id 
    }).populate('assignedDoctor', 'name email specialty');
    
    console.log("Assigned patients count:", assignedPatients.length);
    console.log("Patient IDs:", assignedPatients.map(p => p._id));

    if (assignedPatients.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No patients assigned to this doctor yet.",
        patients: [],
        doctorInfo: {
          name: doctor.name,
          email: doctor.email,
          specialty: doctor.specialty
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${assignedPatients.length} assigned patient(s)`,
      patients: assignedPatients,
      doctorInfo: {
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty
      }
    });

  } catch (error) {
    console.error("Error in getAssignPatients:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error while fetching assigned patients", 
      details: error.message 
    });
  }
};
// Get all patients where assignedDoctor is empty
exports.getUnassignedPatients = async (req, res) => {
  try {
    // Find patients where assignedDoctor is null or not set
    const unassignedPatients = await Patient.find({
      assignedDoctor: { $in: [null, undefined] },
    });

    res.status(200).json(unassignedPatients);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

//Get flap data by patient id
// Get flap data by patient ID with pagination
exports.getFlapByPatientId = async (req, res) => {
  try {
    const { id } = req.params; // Patient ID from route
    const page = parseInt(req.query.page) || 1; // Page number (default 1)
    const limit = parseInt(req.query.limit) || 10; // Items per page (default 10)
    const skip = (page - 1) * limit;

    // Fetch flap records with pagination
    const flapRecords = await FlapData.find({ patient_id: id })
      .populate("patient_id", "name age contact")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Count total records for frontend pagination
    const total = await FlapData.countDocuments({ patient_id: id });

    if (!flapRecords || flapRecords.length === 0) {
      return res
        .status(404)
        .json({ error: "No flap data found for this patient." });
    }

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      records: flapRecords,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Assign all patients to a specific doctor
exports.assignAllPatientsToDoctor = async (req, res) => {
  try {
    const { doctorId, patientIds } = req.body;

    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Validate patientIds array
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({ error: "No patient IDs provided" });
    }

    // Update all patients with the assigned doctor
    const updatedPatients = await Patient.updateMany(
      { _id: { $in: patientIds } },
      { $set: { assignedDoctor: doctorId } }
    );

    res.status(200).json({
      message: "All patients assigned successfully",
      modifiedCount: updatedPatients.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Edit doctor profile
exports.editDoctorProfile = async (req, res) => {
  try {
    const { name, specialty, contact, age } = req.body;
    
    // Get the logged-in user's info from JWT token (set by verifyToken middleware)
    const { email, role } = req.user;
    
    // Verify this is a doctor
    if (role !== 'doctor') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Only doctors can edit their profile." 
      });
    }

    // Validate contact number if provided (must be 10 digits)
    if (contact && !/^\d{10}$/.test(contact)) {
      return res.status(400).json({ 
        success: false,
        message: "Contact number must be exactly 10 digits" 
      });
    }

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor profile not found" 
      });
    }

    // Update only the fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (contact !== undefined) updateData.contact = contact;
    if (age !== undefined) updateData.age = age;

    // Update the doctor profile
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: {
        id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        specialty: updatedDoctor.specialty,
        contact: updatedDoctor.contact,
        age: updatedDoctor.age
      }
    });

  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating doctor profile", 
      error: error.message 
    });
  }
};

// Get current doctor profile
exports.getCurrentDoctorProfile = async (req, res) => {
  try {
    // Get the logged-in user's info from JWT token
    const { email, role } = req.user;
    
    // Verify this is a doctor
    if (role !== 'doctor') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Only doctors can view their profile." 
      });
    }

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor profile not found" 
      });
    }

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        contact: doctor.contact,
        age: doctor.age
      }
    });

  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching doctor profile", 
      error: error.message 
    });
  }
};