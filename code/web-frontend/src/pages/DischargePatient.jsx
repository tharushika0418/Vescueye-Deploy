import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";

const DischargePatient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [patientToDischarge, setPatientToDischarge] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };

    fetchPatients();
  }, [token]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const result = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.contact && p.contact.toLowerCase().includes(term))
    );
    setFiltered(result);
  }, [searchTerm, patients]);

  // Open confirm dialog
  const openConfirmDialog = (patient) => {
    setPatientToDischarge(patient);
    setConfirmOpen(true);
  };

  // Close confirm dialog
  const closeConfirmDialog = () => {
    setConfirmOpen(false);
    setPatientToDischarge(null);
  };

  // Confirm discharge
  const handleConfirmDischarge = async () => {
    try {
      await axios.delete(
        `${API_URL}/users/patients/${patientToDischarge._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPatients((prev) =>
        prev.filter((p) => p._id !== patientToDischarge._id)
      );
      setSnackbarMsg(
        `Patient ${patientToDischarge.name} discharged successfully.`
      );
      setSnackbarOpen(true);

      closeConfirmDialog();
    } catch (err) {
      console.error("Discharge failed", err);
      setSnackbarMsg("Discharge failed. Please try again.");
      setSnackbarOpen(true);
      closeConfirmDialog();
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Discharge Patient
      </Typography>

      <TextField
        label="Search by Name or Contact"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Grid container spacing={2}>
        {filtered.map((p) => (
          <Grid item xs={12} key={p._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2">Contact: {p.contact}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => openConfirmDialog(p)}
                  sx={{ mt: 1 }}
                >
                  Discharge
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm Discharge</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to discharge{" "}
            <strong>{patientToDischarge?.name}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDischarge}>
            Discharge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMsg.includes("failed") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DischargePatient;
