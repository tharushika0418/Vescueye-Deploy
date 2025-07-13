import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl, // Added for Select
  InputLabel, // Added for Select
  Select,
  TextField,
  Typography,
  MenuItem,
  Snackbar, // Added for success/error messages
  Alert, // Added for success/error messages
  CircularProgress, // Added for loading indicator
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const PatientRegister = () => {
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    address: "",
    contact: "",
    medicalHistory: "",
    gender: "", // Ensure gender is initialized for the Select component
  });

  const [errors, setErrors] = useState({}); // More general error state for all fields
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for the current field as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "contact") {
      // Allow only digits and limit to 10
      if (!/^\d*$/.test(value)) {
        return; // Prevent non-digits
      }
      if (value.length > 10) {
        return; // Prevent more than 10 digits
      }
      if (value.length > 0 && value.length < 10) {
        setErrors((prev) => ({ ...prev, contact: "Contact must be 10 digits" }));
      }
    } else if (name === "age") {
      // Ensure age is a positive number
      if (value !== "" && (isNaN(value) || parseInt(value) <= 0)) {
        setErrors((prev) => ({ ...prev, age: "Age must be a positive number" }));
      }
    }

    setPatientData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!patientData.name.trim()) {
      tempErrors.name = "Name is required";
      isValid = false;
    }
    if (!patientData.age || parseInt(patientData.age) <= 0) {
      tempErrors.age = "Valid age is required";
      isValid = false;
    }
    if (!patientData.gender) {
      tempErrors.gender = "Gender is required";
      isValid = false;
    }
    if (!patientData.address.trim()) {
      tempErrors.address = "Address is required";
      isValid = false;
    }
    if (!patientData.contact || patientData.contact.length !== 10) {
      tempErrors.contact = "Contact must be exactly 10 digits";
      isValid = false;
    }
    if (!patientData.medicalHistory.trim()) {
      tempErrors.medicalHistory = "Medical history is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbarMessage("Please correct the errors in the form.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/patient/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        setSnackbarMessage("Patient registered successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Clear form after successful submission
        setPatientData({
          name: "",
          age: "",
          address: "",
          contact: "",
          medicalHistory: "",
          gender: "",
        });
        // Redirect after a short delay for Snackbar to be seen
        setTimeout(() => {
          navigate("/hospital-dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Error registering patient.";
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error registering patient:", errorData);
      }
    } catch (err) {
      console.error("Network error:", err);
      setSnackbarMessage("Network error. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white", // White background for the entire page
        minHeight: "100vh",
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Center vertically as well
      }}
    >
      <Card
        sx={{
          p: 4, // Increased padding for more breathing room
          maxWidth: 550, // Slightly increased max width
          width: "100%",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)", // More prominent shadow
          borderRadius: "16px", // More rounded corners
          backgroundColor: "#ffffff", // Ensure card is white
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            component="h1" // Semantic tag
            gutterBottom
            align="center"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 3, // Increased margin bottom
              textTransform: "uppercase", // Slightly bolder feel
            }}
          >
            Register New Patient
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Patient Name" // More descriptive label
              name="name"
              value={patientData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined" // Explicitly outlined for consistency
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }} // Consistent margin
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={patientData.age}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!errors.age}
              helperText={errors.age}
              InputProps={{ inputProps: { min: 0 } }} // Prevent negative age
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
              <InputLabel id="gender-select-label">Gender</InputLabel>
              <Select
                labelId="gender-select-label"
                id="gender-select"
                name="gender"
                value={patientData.gender}
                label="Gender"
                onChange={handleChange}
                error={!!errors.gender}
              >
                <MenuItem value="">
                  <em>Select Gender</em>
                </MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {errors.gender && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.gender}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={patientData.address}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!errors.address}
              helperText={errors.address}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contact Number" // More descriptive label
              name="contact"
              value={patientData.contact}
              onChange={handleChange}
              required
              placeholder="e.g., 0712345678" // Example format
              margin="normal"
              variant="outlined"
              error={!!errors.contact}
              helperText={errors.contact}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Medical History (e.g., Allergies, Chronic Conditions)" // More descriptive label
              name="medicalHistory"
              multiline
              rows={3} // Increased rows for better input area
              value={patientData.medicalHistory}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!errors.medicalHistory}
              helperText={errors.medicalHistory}
              sx={{ mb: 3 }} // Increased margin before button
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large" // Larger button
              sx={{
                mt: 2,
                py: 1.5, // Padding for taller button
                fontWeight: "bold",
                fontSize: "1.1rem",
                "&:hover": {
                  backgroundColor: "#0056b3", // Darker blue on hover
                },
              }}
              disabled={loading} // Disable button when loading
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register Patient"}
            </Button>
          </form>
        </CardContent>
      </Card>

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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientRegister;