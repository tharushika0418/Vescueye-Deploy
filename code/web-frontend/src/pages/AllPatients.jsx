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
  CircularProgress, // Added for loading indicator
  Alert, // Added for error messages
  InputAdornment, // Added for search icon
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Search icon
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/users/patients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatients(res.data);
        setFilteredPatients(res.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token, API_URL]); // Added API_URL to dependency array

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        (p.contact && p.contact.toLowerCase().includes(value)) ||
        (p.address && p.address.toLowerCase().includes(value)) // Allow searching by address
    );

    setFilteredPatients(filtered);
  };

  return (
    <Box
      sx={{
        backgroundColor: "white", // Explicitly set background to white
        minHeight: "100vh", // Ensure background covers full height
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Align items to the start
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 700 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Registered Patients
        </Typography>

        <Typography
          variant="subtitle1"
          color="textSecondary"
          mb={3}
          align="center"
        >
          Total Patients: {filteredPatients.length}
        </Typography>

        <TextField
          label="Search by Name, Contact, or Address"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography variant="body1" ml={2}>
              Loading patients...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredPatients.length === 0 && (
          <Alert severity="info">No patients found matching your criteria.</Alert>
        )}

        <Grid container direction="column" spacing={2}>
          {!loading &&
            !error &&
            filteredPatients.map((p) => (
              <Grid item key={p._id}>
                <Card
                  variant="outlined" // Gives a subtle border
                  sx={{
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)", // Lift effect on hover
                      boxShadow: "0 6px 12px rgba(0,0,0,0.1)", // More prominent shadow
                    },
                    borderRadius: "12px", // Rounded corners
                    backgroundColor: "#ffffff", // Ensure card background is white
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1} // Add margin bottom for spacing
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: "#007bff", fontWeight: "medium" }} // Highlight name
                      >
                        {p.name}
                      </Typography>
                      <IconButton
                        onClick={() => handleToggle(p._id)}
                        size="small"
                        sx={{ color: "#007bff" }} // Match icon color with name
                      >
                        {expandedId === p._id ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="textSecondary" mb={0.5}>
                      <Box component="span" fontWeight="bold">
                        Age:
                      </Box>{" "}
                      {p.age}
                    </Typography>
                    <Collapse in={expandedId === p._id}>
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                          <Box component="span" fontWeight="bold">
                            Contact:
                          </Box>{" "}
                          {p.contact || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={0.5}>
                          <Box component="span" fontWeight="bold">
                            Address:
                          </Box>{" "}
                          {p.address || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <Box component="span" fontWeight="bold">
                            Medical History:
                          </Box>{" "}
                          {p.medicalHistory || "No medical history recorded."}
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