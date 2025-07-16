import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  TextField,
  Divider,
  Alert,
} from "@mui/material";
import { Download, Android, QrCode } from "@mui/icons-material";
import FlapDetailModal from "../components/FlapDetailModal";
import "../styles/DoctorDashboard.css";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [flapData, setFlapData] = useState([]);
  const [selectedFlap, setSelectedFlap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // APK download URL
  const APK_DOWNLOAD_URL = "https://expo.dev/accounts/vescueye-testuser/projects/Vescueye/builds/dece2a59-1b77-47f8-b3e0-d1aaf1c12730";

  // Generate QR code URL using a free QR code API
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(APK_DOWNLOAD_URL)}`;

  // Fetch assigned patients when component loads
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      try {
        setLoading(true);
        console.log(user.email);
        const response = await fetch(`${API_URL}/users/doctors/patients`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
          }),
        });
        const data = await response.json();
        setAssignedPatients(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assigned patients:", err);
        setError("Failed to load assigned patients.");
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchAssignedPatients();
    }
  }, []);

  // On list item click:
  const handleSelectFlap = (flap, index) => {
    setCurrentIndex(index);
    setSelectedFlap(flap);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  useEffect(() => {
    const fetchFlapData = async () => {
      try {
        if (!selectedPatientId) return;

        setLoading(true);
        setSelectedFlap(null); // Reset selected flap

        const response = await axios.get(
          `${API_URL}/users/flap/search/${selectedPatientId}?page=${page}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFlapData(response.data.records);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching flap data:", err);
        setError("Failed to load flap data.");
        setLoading(false);
      }
    };

    fetchFlapData();
  }, [selectedPatientId, page, token]);

  // Search patients
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredPatients([]);
      return;
    }

    const results = assignedPatients.filter((patient) =>
      patient.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredPatients(results);
  };

  const handleAPKDownload = () => {
    window.open(APK_DOWNLOAD_URL, '_blank');
  };

  return (
    <Box className="dashboard-container">
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Doctor Dashboard
      </Typography>
      
      {/* Doctor Profile Section */}
      {/* Doctor Profile Section */}
<Card className="doctor-profile">
  <CardContent>
    {user ? (
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          justifyContent: "space-between",
        }}
      >
        {/* Left Column - Doctor Info */}
        <Box sx={{ flex: 1 }}>
          <Typography>
            <strong>Name:</strong> {user.name}
          </Typography>
          <Typography>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography>
            <strong>Role:</strong> {user.role}
          </Typography>
        </Box>

        {/* Right Column - APK Download Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2,
            backgroundColor: "#f8f9fa",
            borderRadius: 1,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          {/* QR Code & Text */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <img
              src={QR_CODE_URL}
              alt="QR Code for APK Download"
              style={{
                width: "80px",
                height: "80px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <QrCode sx={{ color: "#666", fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Scan to Download APK
              </Typography>
            </Box>
          </Box>

          {/* Download Button */}
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleAPKDownload}
            sx={{
              backgroundColor: "#4CAF50",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
          >
            Download APK
          </Button>
        </Box>
      </Box>
    ) : (
      <Typography>Loading profile...</Typography>
    )}
  </CardContent>
</Card>


      {/* Two Column Layout */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          width: "100%",
          gap: 3,
        }}
      >
        {/* Left Side - Assigned Patients */}
        <Box
          sx={{
            flexBasis: { xs: "100%", md: "48%" },
            boxSizing: "border-box",
          }}
        >
          <Card className="assigned-patients">
            <CardContent>
              <Typography variant="h5">Assigned Patients</Typography>

              <Box
                sx={{
                  width: "200px",
                  height: "30px",
                  margin: "30px",
                  padding: "5px",
                }}
              >
                <TextField
                  label="Search Patient"
                  value={searchTerm}
                  onChange={handleSearch}
                  fullWidth
                />
              </Box>

              {loading ? (
                <CircularProgress />
              ) : assignedPatients.length > 0 ? (
                (filteredPatients.length > 0
                  ? filteredPatients
                  : assignedPatients
                ).map((patient) => (
                  <Card
                    key={patient._id}
                    className={`patient-item ${
                      selectedPatientId === patient._id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedPatientId(patient._id);
                      setPage(1);
                    }}
                  >
                    <Typography>
                      <strong>Name:</strong> {patient.name}
                    </Typography>
                    <Typography>
                      <strong>Age:</strong> {patient.age}
                    </Typography>
                    <Typography>
                      <strong>Contact:</strong> {patient.contact}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        navigate(`/patient/${patient._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </Card>
                ))
              ) : (
                <Typography>No assigned patients.</Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right Side - Flap Data */}
        <Box
          sx={{
            flexBasis: { xs: "100%", md: "48%" },
            boxSizing: "border-box",
            mb: 5,
            pb: 1,
          }}
        >
          <Card className="flap-data">
            <CardContent>
              <Typography variant="h5">
                {selectedPatientId
                  ? "Flap Data for Selected Patient"
                  : "Select a Patient to View Flap Data"}
              </Typography>

              {loading ? (
                <CircularProgress />
              ) : flapData.length > 0 ? (
                flapData.map((flap, index) => (
                  <Card
                    key={flap._id}
                    className={`flap-item ${
                      selectedFlap?._id === flap._id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectFlap(flap, index)}
                  >
                    <Typography>
                      <strong>Temperature:</strong>{" "}
                      {flap.temperature.toFixed(2)} °C
                    </Typography>
                    <Typography>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(flap.timestamp).toLocaleString()}
                    </Typography>
                  </Card>
                ))
              ) : (
                <Typography>No flap data available.</Typography>
              )}

              {selectedFlap && (
                <FlapDetailModal
                  selectedFlap={selectedFlap}
                  setSelectedFlap={setSelectedFlap}
                  flaps={flapData}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                />
              )}
            </CardContent>

            {flapData.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleNextPage}
                >
                  Next
                </Button>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;