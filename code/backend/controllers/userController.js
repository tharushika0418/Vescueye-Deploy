const User = require("../models/User");
const Patient = require("../models/Patient.js");
const Doctor = require("../models/Doctor.js");
const FlapData = require("../models/FlapData.js");

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
    console.log(email);
    // Check if doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    console.log(existingDoctor);
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
exports.getAssignPatients = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    // Check if the doctor exists
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Find all patients assigned to this doctor
    const assignedPatients = await Patient.find({ assignedDoctor: doctor._id });

    res.status(200).json(assignedPatients);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
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
