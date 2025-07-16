// userRoutes.js - UPDATED VERSION WITH DOCTOR PROFILE ROUTES
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
  editDoctorProfile,
} = require("../controller/userController");

const router = express.Router();

// Doctor profile routes
router.get('/doctor/profile', verifyToken, authorizeRoles("doctor"), getCurrentDoctorProfile);
router.put('/doctor/profile', verifyToken, authorizeRoles("doctor"), editDoctorProfile);

// Doctor and patient assignment routes
router.get("/doctors/patients", verifyToken, authorizeRoles("doctor"), getAssignPatients);
router.post("/assign-patient", verifyToken, authorizeRoles("hospital"), assignPatientToDoctor);
router.post("/assign-all-patients", verifyToken, authorizeRoles("hospital"), assignAllPatientsToDoctor);

// User management routes
router.get("/doctors", verifyToken, authorizeRoles("hospital"), getDoctors);
router.get("/patients", verifyToken, authorizeRoles("hospital"), getPatients);
router.get("/patients/unassigned", verifyToken, authorizeRoles("hospital"), getUnassignedPatients);

// Search routes
router.get("/patient/search", verifyToken, authorizeRoles("hospital", "doctor"), searchPatients);
router.get("/doctor/search", verifyToken, authorizeRoles("hospital"), searchDoctors);

// Registration routes
router.post("/patient/register", verifyToken, authorizeRoles("hospital"), registerPatient);
router.post("/doctor/register", verifyToken, authorizeRoles("hospital"), registerDoctor);

// Individual user routes
router.get("/patient/:id", verifyToken, authorizeRoles("hospital", "doctor"), getPatientById);
router.delete("/:id", verifyToken, authorizeRoles("hospital"), deleteUser);

// Flap-related routes
router.get("/flap/search/:id", verifyToken, authorizeRoles("doctor", "hospital"), getFlapByPatientId);

// Discharge (delete) a patient by ID
router.delete("/patients/:id", verifyToken, authorizeRoles("hospital"), async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(200).json({ message: "Patient discharged" });
  } catch (err) {
    console.error("Discharge Error:", err);
    res.status(500).json({ error: "Failed to discharge patient" });
  }
});

module.exports = router;