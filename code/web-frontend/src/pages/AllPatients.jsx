import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/patients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatients(res.data);
        setFilteredPatients(res.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };

    fetchPatients();
  }, [token]);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        (p.contact && p.contact.toLowerCase().includes(value))
    );

    setFilteredPatients(filtered);
  };

  return (
    <Box p={4} display="flex" justifyContent="center">
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>
          Registered Patients
        </Typography>

        <Typography variant="subtitle1" color="textSecondary" mb={2}>
          Total Patients: {filteredPatients.length}
        </Typography>

        <TextField
          label="Search by Name or Contact"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearch}
        />

        <Grid container direction="column" spacing={2}>
          {filteredPatients.map((p, index) => (
            <Grid item key={p._id}>
              <Card
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">
                      {index + 1}. {p.name}
                    </Typography>
                    <IconButton
                      onClick={() => handleToggle(p._id)}
                      size="small"
                    >
                      {expandedId === p._id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>
                  <Typography variant="body2">Age: {p.age}</Typography>
                  <Collapse in={expandedId === p._id}>
                    <Box mt={1}>
                      <Typography variant="body2">
                        Contact: {p.contact}
                      </Typography>
                      <Typography variant="body2">
                        Address: {p.address || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        Medical History: {p.medicalHistory || "N/A"}
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AllPatients;
