const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const requireRole = require("../middleware/accessControl");
const Patient = require("../models/Patient"); // <-- Make sure this is imported

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
} = require("../controllers/userController");

const router = express.Router();

// ROUTES HERE
router.post("/assign-patient", requireRole("hospital"), assignPatientToDoctor);
router.post(
  "/assign-all-patients",
  requireRole("hospital"),
  assignAllPatientsToDoctor
);
router.get("/doctors", requireRole("hospital"), getDoctors);
router.get("/patients", requireRole("hospital"), getPatients);
router.get(
  "/patients/unassigned",
  requireRole("hospital"),
  getUnassignedPatients
);
router.post(
  "/doctors/patients",
  requireRole("hospital", "doctor"),
  getAssignPatients
);

router.get(
  "/patient/search",
  requireRole("hospital", "doctor"),
  searchPatients
);
router.post("/patient/register", requireRole("hospital"), registerPatient);
router.get("/patient/:id", requireRole("hospital", "doctor"), getPatientById);
router.get("/doctor/search", requireRole("hospital"), searchDoctors);
router.post("/doctor/register", requireRole("hospital"), registerDoctor);
router.delete("/:id", requireRole("hospital"), deleteUser);

router.get(
  "/flap/search/:id",
  requireRole("doctor", "hospital"),
  getFlapByPatientId
);

// ✅ Discharge (delete) a patient by ID
router.delete(
  "/patients/:id",
  requireRole("hospital"), // or verifyToken, depending on how your auth works
  async (req, res) => {
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
  }
);

module.exports = router;
