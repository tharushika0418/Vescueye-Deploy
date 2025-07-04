import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

const PatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/users/patient/search?query=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error searching patients:", error);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 5 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Search Patients
          </Typography>
          <TextField
            fullWidth
            label="Search by Name or Contact"
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
          {patients.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Results:</Typography>
              {patients.map((patient) => (
                <Card key={patient._id} sx={{ mt: 2, p: 2 }}>
                  <Typography>
                    <strong>Name:</strong> {patient.name}
                  </Typography>
                  <Typography>
                    <strong>Age:</strong> {patient.age}
                  </Typography>
                  <Typography>
                    <strong>Contact:</strong> {patient.contact}
                  </Typography>
                  <Typography>
                    <strong>Address:</strong> {patient.address}
                  </Typography>
                  <Typography>
                    <strong>Medical History:</strong> {patient.medicalHistory}
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

export default PatientSearch;
