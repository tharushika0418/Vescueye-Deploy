import { useEffect, useState, useCallback } from "react";
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
  CircularProgress, // Added for loading indicator
  InputAdornment, // Added for search icon
  IconButton, // Added for delete icon
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Search icon
import DeleteIcon from "@mui/icons-material/Delete"; // Delete icon

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // State to hold assigned patients for each doctor (keyed by email)
  const [assignedPatients, setAssignedPatients] = useState({});
  const [fetchingPatientsFor, setFetchingPatientsFor] = useState(null); // To show loading for specific doctor's patients

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doctorToRemove, setDoctorToRemove] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(res.data);
      setFilteredDoctors(res.data); // Initialize filtered doctors
      const uniqueSpecialties = [
        ...new Set(res.data.map((doc) => doc.specialty)),
      ];
      setSpecialties(uniqueSpecialties);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors. Please try again.");
      setDoctors([]); // Clear doctors on error
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const getAssignedPatients = async (email) => {
    if (assignedPatients[email]) {
      // If already fetched, clear to collapse
      setAssignedPatients((prev) => {
        const newState = { ...prev };
        delete newState[email];
        return newState;
      });
      return;
    }
    setFetchingPatientsFor(email); // Set loading state for this doctor
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
    } catch (err) {
      console.error("Error fetching assigned patients:", err);
      setSnackbarMsg("Failed to load assigned patients.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setFetchingPatientsFor(null); // Clear loading state
    }
  };

  const openConfirmDialog = (doctor) => {
    setDoctorToRemove(doctor);
    setConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmOpen(false);
    setDoctorToRemove(null);
  };

  const handleConfirmDischarge = async () => {
    if (!doctorToRemove) return;
    try {
      await axios.delete(`${API_URL}/users/doctor/${doctorToRemove._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistically update UI
      setDoctors((prev) => prev.filter((p) => p._id !== doctorToRemove._id));
      setFilteredDoctors((prev) =>
        prev.filter((p) => p._id !== doctorToRemove._id)
      );

      setSnackbarMsg(`Dr. ${doctorToRemove.name} removed successfully.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Delete failed", err);
      setSnackbarMsg("Delete failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      closeConfirmDialog();
    }
  };

  useEffect(() => {
    let currentFiltered = doctors;

    if (selectedSpecialty !== "") {
      currentFiltered = currentFiltered.filter(
        (doc) => doc.specialty === selectedSpecialty
      );
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(lowerSearch) ||
          doc.email.toLowerCase().includes(lowerSearch) ||
          (doc.contact && doc.contact.toLowerCase().includes(lowerSearch)) ||
          (doc.specialty && doc.specialty.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredDoctors(currentFiltered);
  }, [searchTerm, selectedSpecialty, doctors]);

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: "100vh",
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 700 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#333", mb: 4 }}
        >
          Registered Doctors
        </Typography>

        {/* Filters and Search */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            label="Search by Name, Email, Contact, or Specialty"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth sx={{ minWidth: 180 }}>
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
        </Box>

        {/* Loading, Error, and No Doctors states */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography variant="body1" ml={2} color="textSecondary">
              Loading doctors...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No doctors found matching your criteria.
          </Alert>
        )}

        {/* Doctors List */}
        {!loading && !error && (
          <List>
            {filteredDoctors.map((doc) => (
              <ListItem
                key={doc._id}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: 2,
                  marginBottom: 2,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ color: "#007bff", fontWeight: "bold" }}>
                        Dr. {doc.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        Specialty:{" "}
                        <Box component="span" fontWeight="medium">
                          {doc.specialty || "N/A"}
                        </Box>
                        <br />
                        Email:{" "}
                        <Box component="span" fontWeight="medium">
                          {doc.email}
                        </Box>
                        <br />
                        Contact:{" "}
                        <Box component="span" fontWeight="medium">
                          {doc.contact || "N/A"}
                        </Box>
                      </Typography>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => getAssignedPatients(doc.email)}
                      sx={{
                        borderColor: "#007bff",
                        color: "#007bff",
                        "&:hover": {
                          backgroundColor: "#e7f5ff",
                          borderColor: "#0056b3",
                        },
                      }}
                    >
                      {assignedPatients[doc.email] ? "Hide Patients" : "Show Assigned Patients"}
                    </Button>
                    <IconButton
                      aria-label="delete doctor"
                      color="error"
                      onClick={() => openConfirmDialog(doc)}
                      sx={{ alignSelf: "flex-end" }} // Align to end of its container
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                {fetchingPatientsFor === doc.email && (
                  <Box display="flex" justifyContent="center" width="100%" mt={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" ml={1} color="textSecondary">
                      Loading patients...
                    </Typography>
                  </Box>
                )}
                {assignedPatients[doc.email]?.length > 0 &&
                  fetchingPatientsFor !== doc.email && (
                    <Box sx={{ width: "100%", mt: 1, pl: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                        Assigned Patients:
                      </Typography>
                      <List dense disablePadding>
                        {assignedPatients[doc.email].map((p, i) => (
                          <ListItem key={i} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2">
                                  {p.name} (<span style={{ fontWeight: 'bold' }}>{p.contact}</span>)
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                {assignedPatients[doc.email]?.length === 0 &&
                  assignedPatients[doc.email] !== undefined &&
                  fetchingPatientsFor !== doc.email && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, pl: 2 }}>
                      No patients currently assigned.
                    </Typography>
                  )}
              </ListItem>
            ))}
          </List>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={closeConfirmDialog}>
          <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
            Confirm Removal
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove Dr.{" "}
              <Typography component="span" fontWeight="bold">
                {doctorToRemove?.name}
              </Typography>
              ? This action cannot be undone and will permanently delete their record.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleConfirmDischarge} variant="contained" color="error">
              Remove Doctor
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%", boxShadow: 3 }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AllDoctors;