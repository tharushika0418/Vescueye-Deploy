// userRoutes.js - FIXED VERSION
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
} = require("../controller/userController");

const router = express.Router();

// FIXED: Changed from POST to GET for fetching assigned patients
router.get("/doctors/patients", verifyToken, authorizeRoles("doctor"), getAssignPatients);

// Other routes remain the same
router.post("/assign-patient", verifyToken, authorizeRoles("hospital"), assignPatientToDoctor);
router.post("/assign-all-patients", verifyToken, authorizeRoles("hospital"), assignAllPatientsToDoctor);
router.get("/doctors", verifyToken, authorizeRoles("hospital"), getDoctors);
router.get("/patients", verifyToken, authorizeRoles("hospital"), getPatients);
router.get("/patients/unassigned", verifyToken, authorizeRoles("hospital"), getUnassignedPatients);
router.get("/patient/search", verifyToken, authorizeRoles("hospital", "doctor"), searchPatients);
router.post("/patient/register", verifyToken, authorizeRoles("hospital"), registerPatient);
router.get("/patient/:id", verifyToken, authorizeRoles("hospital", "doctor"), getPatientById);
router.get("/doctor/search", verifyToken, authorizeRoles("hospital"), searchDoctors);
router.post("/doctor/register", verifyToken, authorizeRoles("hospital"), registerDoctor);
router.delete("/:id", verifyToken, authorizeRoles("hospital"), deleteUser);
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