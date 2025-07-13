import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Snackbar,
  Alert,
  CircularProgress, // Added for loading states
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"; // Icon for assign button
import { useNavigate } from "react-router-dom";

const AssignPatient = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  const [loadingDoctors, setLoadingDoctors] = useState(true); // Loading state for doctors
  const [loadingPatients, setLoadingPatients] = useState(true); // Loading state for patients
  const [assigning, setAssigning] = useState(false); // Loading state for assignment action

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Corrected typo here

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const response = await axios.get(`${API_URL}/users/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setSnackbarMessage("Failed to load doctors.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingDoctors(false);
    }
  }, [token, API_URL]);

  const fetchPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const response = await axios.get(`${API_URL}/users/patients/unassigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching unassigned patients:", error);
      setSnackbarMessage("Failed to load unassigned patients.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingPatients(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, [fetchDoctors, fetchPatients]);

  const handleAssign = async () => {
    if (!selectedDoctor) {
      setSnackbarMessage("Please select a doctor.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (!selectedPatient) {
      setSnackbarMessage("Please select a patient or 'Assign All'.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setAssigning(true); // Set loading state for assignment button
    try {
      let response;
      let successMessage;

      if (selectedPatient === "assign_all") {
        const allPatientIds = patients.map((pat) => pat._id);
        if (allPatientIds.length === 0) {
            setSnackbarMessage("No unassigned patients to assign.");
            setSnackbarSeverity("info");
            setSnackbarOpen(true);
            setAssigning(false);
            return;
        }
        response = await axios.post(
          `${API_URL}/users/assign-all-patients`,
          {
            doctorId: selectedDoctor,
            patientIds: allPatientIds,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        successMessage = "All eligible patients assigned successfully!";
      } else {
        response = await axios.post(
          `${API_URL}/users/assign-patient`,
          {
            doctorId: selectedDoctor,
            patientId: selectedPatient,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const assignedPatient = patients.find(p => p._id === selectedPatient);
        successMessage = `Patient ${assignedPatient ? assignedPatient.name : ''} assigned successfully!`;
      }

      if (response.status === 200) { // Axios uses status for success, not response.ok
        setSnackbarMessage(successMessage);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Reset form selections
        setSelectedDoctor("");
        setSelectedPatient("");
        // Re-fetch patients to update the unassigned list
        fetchPatients();
      } else {
        // This part might be better handled by axios catch block for non-2xx responses
        const errorMessage = response.data?.error || "Failed to assign patient(s).";
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Assignment failed with status:", response.status, response.data);
      }
    } catch (error) {
      console.error("Error during assignment:", error);
      const errorMessage = error.response?.data?.error || "Failed to assign patient(s). Please try again.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setAssigning(false); // Clear loading state
      // Navigate after a short delay for Snackbar to be seen, only if successful
      if (snackbarSeverity === "success") {
        setTimeout(() => navigate("/hospital-dashboard"), 1500);
      }
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white", 
        minHeight: "100vh",
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Center vertically for the form
      }}
    >
      <Card
        sx={{
          p: 4,
          maxWidth: 550,
          width: "100%",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 3,
              textTransform: "uppercase",
            }}
          >
            Assign Patient to Doctor
          </Typography>

          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              id="doctor-select"
              value={selectedDoctor}
              label="Select Doctor"
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={loadingDoctors || assigning}
            >
              {loadingDoctors ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 2 }} /> Loading Doctors...
                </MenuItem>
              ) : doctors.length === 0 ? (
                <MenuItem disabled>No doctors available</MenuItem>
              ) : (
                doctors.map((doc) => (
                  <MenuItem key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialty})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
            <InputLabel id="patient-select-label">Select Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              id="patient-select"
              value={selectedPatient}
              label="Select Patient"
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={loadingPatients || assigning}
            >
              {loadingPatients ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 2 }} /> Loading Patients...
                </MenuItem>
              ) : patients.length === 0 ? (
                <MenuItem disabled>No unassigned patients</MenuItem>
              ) : (
                [
                  <MenuItem key="assign_all" value="assign_all" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Assign All Unassigned Patients
                  </MenuItem>,
                  ...patients.map((pat) => (
                    <MenuItem key={pat._id} value={pat._id}>
                      {pat.name} (Age: {pat.age}) - Contact: {pat.contact}
                    </MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1.1rem",
              "&:hover": {
                backgroundColor: "#0056b3",
              },
            }}
            onClick={handleAssign}
            disabled={!selectedDoctor || !selectedPatient || assigning} // Disable if no selection or currently assigning
            startIcon={assigning ? <CircularProgress size={24} color="inherit" /> : <AssignmentIndIcon />}
          >
            {assigning ? "Assigning..." : "Assign Patient(s)"}
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000} // Increased duration
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Changed to bottom center
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignPatient;