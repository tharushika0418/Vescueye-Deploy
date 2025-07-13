import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Snackbar, // Added for success/error messages
  Alert, // Added for success/error messages
  CircularProgress, // Added for loading indicator
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const DoctorRegister = () => {
  const [doctorData, setDoctorData] = useState({
    name: "",
    age: "",
    specialty: "",
    contact: "",
    email: "",
  });

  const [errors, setErrors] = useState({}); // Unified error state for all fields
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
    } else if (name === "email") {
      // Basic email format validation
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      }
    } else if (name === "age") {
      // Allow only digits and ensure age is within range
      if (!/^\d*$/.test(value)) return; // Prevent non-numeric input
      const ageNum = Number(value);
      if (value !== "" && (ageNum < 25 || ageNum > 100)) {
        setErrors((prev) => ({
          ...prev,
          age: "Age must be between 25 and 100",
        }));
      }
    }

    setDoctorData((prevState) => ({
      ...prevState,
      [name]: name === "age" ? (value ? Number(value) : "") : value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!doctorData.name.trim()) {
      tempErrors.name = "Name is required";
      isValid = false;
    }
    if (!doctorData.age || doctorData.age < 25 || doctorData.age > 100) {
      tempErrors.age = "Age must be between 25 and 100";
      isValid = false;
    }
    if (!doctorData.specialty.trim()) {
      tempErrors.specialty = "Specialty is required";
      isValid = false;
    }
    if (!doctorData.contact || doctorData.contact.length !== 10) {
      tempErrors.contact = "Contact must be exactly 10 digits";
      isValid = false;
    }
    if (!doctorData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorData.email)) {
      tempErrors.email = "Valid email is required";
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
      const response = await fetch(`${API_URL}/users/doctor/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(doctorData),
      });

      if (response.ok) {
        setSnackbarMessage("Doctor registered successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Clear form after successful submission
        setDoctorData({
          name: "",
          age: "",
          specialty: "",
          contact: "",
          email: "",
        });
        // Redirect after a short delay for Snackbar to be seen
        setTimeout(() => {
          navigate("/hospital-dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Error registering doctor.";
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error registering doctor:", errorData);
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
          maxWidth: 550, // Consistent max width
          width: "100%",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)", // More prominent shadow
          borderRadius: "16px", // More rounded corners
          backgroundColor: "#ffffff", // Ensure card is white
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
            Register New Doctor
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Doctor's Name" // More descriptive label
              name="name"
              value={doctorData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined" // Explicitly outlined
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }} // Consistent margin
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={doctorData.age}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!errors.age}
              helperText={errors.age}
              inputProps={{ min: "25", max: "100", step: "1" }} // Restrict numeric input
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Specialty (e.g., Cardiology, Pediatrics)" // More descriptive label
              name="specialty"
              value={doctorData.specialty}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!errors.specialty}
              helperText={errors.specialty}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contact Number"
              name="contact"
              value={doctorData.contact}
              onChange={handleChange}
              required
              placeholder="e.g., 0771234567" // Example format
              margin="normal"
              variant="outlined"
              error={!!errors.contact}
              helperText={errors.contact}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email" // Semantic type for email input
              value={doctorData.email}
              onChange={handleChange}
              required
              placeholder="e.g., doctor@example.com"
              margin="normal"
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
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
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1.1rem",
                "&:hover": {
                  backgroundColor: "#0056b3",
                },
              }}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register Doctor"
              )}
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

export default DoctorRegister;