import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // <-- New state
  const [visibleDoctors, setVisibleDoctors] = useState([]); // For animation
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doctorToRemove, setDoctorToRemove] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctors(res.data);
        setFilteredDoctors(res.data);
        console.log(res.data);

        const uniqueSpecialties = [
          ...new Set(res.data.map((doc) => doc.specialty)),
        ];
        setSpecialties(uniqueSpecialties);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [token]);

  const getAssignedPatients = async (email) => {
    setAssignedPatients([]);
    console.log(email);
    try {
      const res = await axios.post(
        `${API_URL}/users/doctors/patients`,
        {
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignedPatients((prev) => ({
        ...prev,
        [email]: res.data || [],
      }));
      console.log("assignedPatients", assignedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const openConfirmDialog = (doctor) => {
    setDoctorToRemove(doctor);
    setConfirmOpen(true);
  };

  // Close confirm dialog
  const closeConfirmDialog = () => {
    setConfirmOpen(false);
    setDoctorToRemove(null);
  };

  // Confirm discharge
  const handleConfirmDischarge = async () => {
    try {
      await axios.delete(`${API_URL}/users/doctor/${doctorToRemove._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoctors((prev) => prev.filter((p) => p._id !== doctorToRemove._id));
      setSnackbarMsg(`Dr. ${doctorToRemove.name} removed successfully.`);
      setSnackbarOpen(true);

      closeConfirmDialog();
    } catch (err) {
      console.error("Delete failed", err);
      setSnackbarMsg("Delete failed. Please try again.");
      setSnackbarOpen(true);
      closeConfirmDialog();
    }
  };

  // Combine filters on searchTerm and selectedSpecialty
  useEffect(() => {
    let filtered = doctors;

    if (selectedSpecialty !== "") {
      filtered = filtered.filter((doc) => doc.specialty === selectedSpecialty);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  // Animate filtered doctors appearance
  useEffect(() => {
    setVisibleDoctors([]);
    const timeout = setTimeout(() => {
      setVisibleDoctors(filteredDoctors);
    }, 50);
    return () => clearTimeout(timeout);
  }, [filteredDoctors]);

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>
          Registered Doctors
        </Typography>

        {/* Search input */}
        <TextField
          label="Search by Name"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Filter by Specialty</InputLabel>
          <Select
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
            label="Filter by Specialty"
          >
            <MenuItem value="">All</MenuItem>
            {specialties.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <List>
          {doctors.length === 0 && <Typography>No doctors found.</Typography>}

          {visibleDoctors.map((doc, index) => (
            <ListItem
              key={doc._id}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #ccc",
                borderRadius: 2,
                padding: 2,
                marginBottom: 2,
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                opacity: 1,
                transform: "translateX(0)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                ...(visibleDoctors.includes(doc)
                  ? {}
                  : { opacity: 0, transform: "translateX(-20px)" }),
              }}
            >
              <ListItemText
                primary={`${index + 1}. ${doc.name} (${doc.specialty})`}
                secondary={
                  <>
                    <div>Email: {doc.email}</div>
                    <div>Contact: {doc.contact || "N/A"}</div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => getAssignedPatients(doc.email)}
                      sx={{ marginRight: 4 }}
                    >
                      Assigned Patients
                    </Button>
                    {assignedPatients[doc.email]?.length > 0 && (
                      <ul style={{ marginTop: 8 }}>
                        {assignedPatients[doc.email].map((p, i) => (
                          <>
                            <li key={i}>
                              {p.name} ({p.contact})
                            </li>
                          </>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => openConfirmDialog(doc)}
                    >
                      Delete
                    </Button>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={closeConfirmDialog}>
          <DialogTitle>Confirm Remove</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove Dr.{" "}
              <strong>{doctorToRemove?.name}</strong>? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog}>Cancel</Button>
            <Button color="error" onClick={handleConfirmDischarge}>
              Delete
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
    </Box>
  );
};

export default AllDoctors;
