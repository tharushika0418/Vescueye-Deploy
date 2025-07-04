import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AssignPatient = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const token = localStorage.getItem("token");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("error");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/users/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/users/patients/unassigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedDoctor) {
      alert("Please select a doctor.");
      return;
    }

    if (selectedPatient === "assign_all") {
      // Assign all patients
      const allPatientIds = patients.map((pat) => pat._id);
      try {
        const response = await fetch(`${API_URL}/users/assign-all-patients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: selectedDoctor,
            patientIds: allPatientIds,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setSnackbarMessage("All patients assigned successfully!");
          setSnackBarSeverity("success");
          setSnackbarOpen(true);
          setSelectedDoctor("");
          setSelectedPatient("");
        } else {
          setSnackbarMessage(data.error || "Failed to assign all patients.");
          setSnackBarSeverity("error");
          setSnackbarOpen(true);
          setSelectedDoctor("");
          setSelectedPatient("");
        }
      } catch (error) {
        console.error("Error assigning all patients:", error);
      } finally {
        setTimeout(() => window.location.reload(), 2000);
      }
    } else {
      // Assign a single patient
      try {
        const response = await fetch(`${API_URL}/users/assign-patient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: selectedDoctor,
            patientId: selectedPatient,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setSnackbarMessage("Patient assigned successfully!");
          setSnackBarSeverity("success");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage(data.error || "Failed to assign patient.");
          setSnackBarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error assigning patient:", error);
        setSnackbarMessage("Failed to assign patient. Please try again.");
        setSnackBarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setTimeout(() => navigate("/hospital-dashboard"), 2000);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 5 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Assign Patient to Doctor
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Select Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              {doctors.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  {doc.name} ({doc.specialty})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Select Patient</InputLabel>
            <Select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <MenuItem value="assign_all">Assign All</MenuItem>
              {patients.map((pat) => (
                <MenuItem key={pat._id} value={pat._id}>
                  {pat.name} (Age: {pat.age})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleAssign}
          >
            Assign Patient
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignPatient;
