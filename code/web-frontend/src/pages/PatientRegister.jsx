import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Select,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const PatientRegister = () => {
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    address: "",
    contact: "",
    medicalHistory: "",
  });

  const [errors, setErrors] = useState({ contact: "" });
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      if (!/^\d{0,10}$/.test(value)) return; // Allow only up to 10 digits
      if (value.length === 10) {
        setErrors((prev) => ({ ...prev, contact: "" })); // Clear error if valid
      } else {
        setErrors((prev) => ({
          ...prev,
          contact: "Contact must be 10 digits",
        }));
      }
    }

    setPatientData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (patientData.contact.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        contact: "Contact must be exactly 10 digits",
      }));
      return;
    }

    const response = await fetch(`${API_URL}/users/patient/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(patientData),
    });

    if (response.ok) {
      console.log("Patient registered successfully");
      navigate("/hospital-dashboard");
      setPatientData({
        name: "",
        age: "",
        address: "",
        contact: "",
        medicalHistory: "",
        gender: "",
      });
    } else {
      console.error("Error registering patient");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 5 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Register Patient
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={patientData.name}
              onChange={handleChange}
              required
              margin="normal"
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
            />
            <Select
              labelId="patient-label"
              id="patient-select"
              name="gender"
              value={patientData.gender}
              label="Gender"
              onChange={handleChange}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={patientData.address}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact"
              name="contact"
              value={patientData.contact}
              onChange={handleChange}
              required
              placeholder="Enter a 10-digit contact number"
              margin="normal"
              error={!!errors.contact}
              helperText={errors.contact}
            />
            <TextField
              fullWidth
              label="Medical History"
              name="medicalHistory"
              multiline
              rows={2}
              value={patientData.medicalHistory}
              onChange={handleChange}
              required
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Register Patient
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientRegister;
