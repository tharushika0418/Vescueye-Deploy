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
        setSnackbarMsg("Failed to load patients. Please try again.");
        setSnackbarOpen(true);
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
    <Box
      p={{ xs: 2, md: 4 }} // Responsive padding
      sx={{
        backgroundColor: "#f5f5f5", // Light background for the whole page
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        component="h1" // Use h1 for semantic correctness
        gutterBottom
        align="center"
        sx={{
          mb: 4,
          color: "#3f51b5", // A primary color for the title
          fontWeight: "bold",
        }}
      >
        Discharge Patient
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
        {" "}
        {/* Centered and max-width for search */}
        <TextField
          label="Search by Patient Name or Contact" // More descriptive label
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px", // Slightly rounded corners
              backgroundColor: "#ffffff", // White background for the input
            },
            "& .MuiInputLabel-root": {
              color: "#757575", // Lighter label color
            },
          }}
        />
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {" "}
        {/* More spacing and centered grid */}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" color="textSecondary">
              {searchTerm
                ? "No patients found matching your search."
                : "No patients to display."}
            </Typography>
          </Grid>
        )}
        {filtered.map((p) => (
          <Grid item xs={12} sm={8} md={6} lg={4} key={p._id}>
            {" "}
            {/* Responsive card width */}
            <Card
              elevation={3} // Add some shadow for depth
              sx={{
                borderRadius: "12px", // More rounded corners
                transition: "transform 0.2s ease-in-out", // Smooth hover effect
                "&:hover": {
                  transform: "translateY(-5px)", // Lift card on hover
                  boxShadow: "0 6px 12px rgba(0,0,0,0.1)", // Enhanced shadow on hover
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ mb: 1, color: "#333", fontWeight: "medium" }}
                >
                  {p.name}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                  Contact: {p.contact || "N/A"}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth // Make button take full width of card
                  onClick={() => openConfirmDialog(p)}
                  sx={{
                    mt: 1,
                    py: 1.2, // More vertical padding
                    borderRadius: "8px",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#d32f2f", // Darker red on hover
                    },
                  }}
                >
                  Discharge Patient
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ color: "#d32f2f" }}>
          Confirm Patient Discharge
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you absolutely sure you want to discharge{" "}
            <Typography component="span" fontWeight="bold" color="text.primary">
              {patientToDischarge?.name}
            </Typography>
            ? This action is irreversible and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeConfirmDialog}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleConfirmDischarge}
            variant="contained"
            autoFocus
          >
            Confirm Discharge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000} // Slightly longer duration
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMsg.includes("failed") ? "error" : "success"}
          sx={{ width: "100%", borderRadius: "8px" }} // Rounded corners for alert
          variant="filled" // Filled variant for better visibility
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DischargePatient;