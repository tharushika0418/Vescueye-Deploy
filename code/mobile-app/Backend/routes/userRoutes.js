// userRoutes.js - FIXED ROUTE ORDER
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

// Add general request logging for all routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

// ===================================
// SPECIFIC ROUTES FIRST (CRITICAL!)
// ===================================

// DOCTOR SPECIFIC ROUTES - MUST BE BEFORE GENERIC ROUTES
router.get('/doctor/profile', verifyToken, authorizeRoles("doctor"), getCurrentDoctorProfile);
router.put('/doctor/profile', verifyToken, authorizeRoles("doctor"), editDoctorProfile);
router.get("/doctor/patients", verifyToken, authorizeRoles("doctor"), getAssignPatients);
router.get("/doctor/search", verifyToken, authorizeRoles("hospital"), searchDoctors);
router.post("/doctor/register", verifyToken, authorizeRoles("hospital"), registerDoctor);

// PATIENT SPECIFIC ROUTES
router.get("/patient/search", verifyToken, authorizeRoles("hospital", "doctor"), searchPatients);
router.post("/patient/register", verifyToken, authorizeRoles("hospital"), registerPatient);
router.get("/patients/unassigned", verifyToken, authorizeRoles("hospital"), getUnassignedPatients);

// ASSIGNMENT ROUTES
router.post("/assign-patient", verifyToken, authorizeRoles("hospital"), assignPatientToDoctor);
router.post("/assign-all-patients", verifyToken, authorizeRoles("hospital"), assignAllPatientsToDoctor);

// FLAP ROUTES
router.get("/flap/search/:id", verifyToken, authorizeRoles("doctor", "hospital"), getFlapByPatientId);

// ===================================
// GENERIC ROUTES LAST (IMPORTANT!)
// ===================================

// Get all doctors (hospital only)
router.get("/doctors", verifyToken, authorizeRoles("hospital"), getDoctors);

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

// Get patient by ID - MOVED TO END
router.get("/patient/:id", verifyToken, authorizeRoles("hospital", "doctor"), getPatientById);

// Delete user by ID (hospital only) - MOVED TO END
router.delete("/user/:id", verifyToken, authorizeRoles("hospital"), deleteUser);

// Catch any unmatched routes
router.use((req, res) => {
  console.log('=== UNMATCHED ROUTE ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Original URL:', req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path 
  });
});

module.exports = router;