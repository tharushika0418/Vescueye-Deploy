import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
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

  const [errors, setErrors] = useState({ contact: "", email: "", age: "" });

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "age") {
      if (!/^\d*$/.test(value)) return; // Prevent non-numeric input
      const ageNum = Number(value);
      if (ageNum && (ageNum < 25 || ageNum > 100)) {
        setErrors((prev) => ({
          ...prev,
          age: "Age must be between 25 and 100",
        }));
      } else {
        setErrors((prev) => ({ ...prev, age: "" }));
      }
    }

    setDoctorData((prevState) => ({
      ...prevState,
      [name]: name === "age" ? (value ? Number(value) : "") : value, // Ensure age is stored as a number
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (doctorData.contact.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        contact: "Contact must be exactly 10 digits",
      }));
      return;
    }

    if (errors.email || errors.age) {
      return; // Prevent submission if email or age is invalid
    }

    const response = await fetch(`${API_URL}/users/doctor/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(doctorData),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Doctor registered successfully");
      navigate("/hospital-dashboard");
      setDoctorData({
        name: "",
        age: "",
        specialty: "",
        contact: "",
        email: "",
      });
    } else {
      console.error("Error registering doctor");
      window.alert(data.message || "Failed to register doctor");
      window.location.reload();
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 5 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Register Doctor
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={doctorData.name}
              onChange={handleChange}
              required
              margin="normal"
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
              error={!!errors.age}
              helperText={errors.age}
              inputProps={{ min: "25", max: "100", step: "1" }} // Restrict number input
            />
            <TextField
              fullWidth
              label="Specialty"
              name="specialty"
              value={doctorData.specialty}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact"
              name="contact"
              value={doctorData.contact}
              onChange={handleChange}
              required
              placeholder="Enter a 10-digit contact number"
              margin="normal"
              error={!!errors.contact}
              helperText={errors.contact}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={doctorData.email}
              onChange={handleChange}
              required
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!!errors.email || !!errors.contact || !!errors.age}
            >
              Register Doctor
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorRegister;
