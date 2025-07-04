import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

const DoctorSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/users/doctor/search?query=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error searching doctors:", error);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 5 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Search Doctors
          </Typography>
          <TextField
            fullWidth
            label="Search by Name or Contact or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>

          {/* Display Search Results */}
          {doctors.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Results:</Typography>
              {doctors.map((doctor) => (
                <Card key={doctor._id} sx={{ mt: 2, p: 2 }}>
                  <Typography>
                    <strong>Name:</strong> {doctor.name}
                  </Typography>
                  <Typography>
                    <strong>Specialty:</strong> {doctor.specialty}
                  </Typography>
                  <Typography>
                    <strong>Contact:</strong> {doctor.contact}
                  </Typography>
                  <Typography>
                    <strong>Email Address:</strong> {doctor.email}
                  </Typography>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorSearch;
