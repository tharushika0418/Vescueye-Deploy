// userRoutes.js - IMPROVED VERSION
const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/accessControl");
const Patient = require("../models/Patient");

const {
  getDoctors,
  getPatientById,
  getPatients,
  deleteUser,
  registerPatient,
  registerDoctor,
  searchPatients,
  searchDoctors,
  getFlapByPatientId,
  getAssignPatients,
  getUnassignedPatients,
  assignPatientToDoctor,
  assignAllPatientsToDoctor,
  getCurrentDoctorProfile,
  editDoctorProfile
} = require("../controller/userController");

const router = express.Router();

// DOCTOR ROUTES (more specific routes first)
// Get current doctor profile
router.get('/doctor/profile', verifyToken, authorizeRoles("doctor"), getCurrentDoctorProfile);

// Edit doctor profile
router.put('/doctor/profile', verifyToken, authorizeRoles("doctor"), editDoctorProfile);

// Get assigned patients for current doctor
router.get("/doctor/patients", verifyToken, authorizeRoles("doctor"), getAssignPatients);

// Search doctors (hospital only)
router.get("/doctor/search", verifyToken, authorizeRoles("hospital"), searchDoctors);

// Register new doctor (hospital only)
router.post("/doctor/register", verifyToken, authorizeRoles("hospital"), registerDoctor);

// Get all doctors (hospital only)
router.get("/doctors", verifyToken, authorizeRoles("hospital"), getDoctors);

// PATIENT ROUTES
// Search patients
router.get("/patient/search", verifyToken, authorizeRoles("hospital", "doctor"), searchPatients);

// Register new patient (hospital only)
router.post("/patient/register", verifyToken, authorizeRoles("hospital"), registerPatient);

// Get unassigned patients (hospital only)
router.get("/patients/unassigned", verifyToken, authorizeRoles("hospital"), getUnassignedPatients);

// Get all patients (hospital only)
router.get("/patients", verifyToken, authorizeRoles("hospital"), getPatients);

// Discharge (delete) a patient by ID (hospital only)
router.delete("/patients/:id", verifyToken, authorizeRoles("hospital"), async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(200).json({ message: "Patient discharged successfully" });
  } catch (err) {
    console.error("Discharge Error:", err);
    res.status(500).json({ error: "Failed to discharge patient" });
  }
});

// Get patient by ID
router.get("/patient/:id", verifyToken, authorizeRoles("hospital", "doctor"), getPatientById);

// ASSIGNMENT ROUTES
// Assign patient to doctor (hospital only)
router.post("/assign-patient", verifyToken, authorizeRoles("hospital"), assignPatientToDoctor);

// Assign all patients to doctor (hospital only)
router.post("/assign-all-patients", verifyToken, authorizeRoles("hospital"), assignAllPatientsToDoctor);

// FLAP ROUTES
// Get flap by patient ID
router.get("/flap/search/:id", verifyToken, authorizeRoles("doctor", "hospital"), getFlapByPatientId);

// GENERIC USER ROUTES (most specific routes last)
// Delete user by ID (hospital only) - made more specific
router.delete("/user/:id", verifyToken, authorizeRoles("hospital"), deleteUser);

module.exports = router;