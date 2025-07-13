import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/HospitalDashboard.css";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";

const HospitalDashboard = () => {
  const { user } = useContext(AuthContext);
  const lastLogin = localStorage.getItem("lastLogin");

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- Date Formatting ---
  const getFormattedDate = (date) => {
    const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
    let formatted = date.toLocaleDateString('en-US', optionsDate);

    const day = date.getDate();
    let suffix;
    if (day > 3 && day < 21) { // Covers 11th, 12th, 13th
      suffix = 'th';
    } else {
      switch (day % 10) {
        case 1: suffix = 'st'; break;
        case 2: suffix = 'nd'; break;
        case 3: suffix = 'rd'; break;
        default: suffix = 'th';
      }
    }
    return formatted.replace(/(\d+)/, `$1${suffix}`);
  };

  // --- Time Formatting (without seconds) ---
  const getFormattedTime = (date) => {
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', optionsTime);
  };

  const formattedDate = getFormattedDate(currentDateTime);
  const formattedTime = getFormattedTime(currentDateTime);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-enhanced">
        <div className="header-content">
          <div className="header-right">
            <div className="header-text">
              <Typography variant="h3" className="main-title2">
                Hospital Management System
              </Typography>
              <Typography variant="subtitle1" className="welcome-text">
                Welcome back, {user?.name || 'Administrator'}!
              </Typography>
            </div>
          </div>
          <div className="header-right">
            <div className="live-info-container">
              <div className="datetime-info">
                <Typography variant="body1" className="live-datetime">
                  {formattedDate} - {formattedTime}
                </Typography>
                {lastLogin && (
                  <Typography variant="body2" className="last-login-info">
                    Last Login: {lastLogin}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="management-sections">
        <div className="section-title-container">
          <Typography variant="h4" className="section-title">
            Management Dashboard
          </Typography>
          <div className="title-underline"></div>
        </div>

        <Box className="management-grid">
          {/* Patient Management */}
          <Card className="management-card patient-management">
            <CardContent className="management-card-content">
              <div className="section-header">
                <div className="section-icon-container">
                  <span className="section-icon">👥</span>
                </div>
                <Typography variant="h5" className="section-heading">
                  Patient Management
                </Typography>
              </div>

              <div className="action-buttons">
                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn patients-btn"
                  component={Link}
                  to="/all-patients"
                >
                  <span className="btn-icon">📋</span>
                  <span className="btn-text">Registered Patients</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn register-btn"
                  component={Link}
                  to="/register-patient"
                >
                  <span className="btn-icon">➕</span>
                  <span className="btn-text">Register New Patient</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn search-btn"
                  component={Link}
                  to="/search-patient"
                >
                  <span className="btn-icon">🔍</span>
                  <span className="btn-text">Search Patient</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn discharge-btn"
                  component={Link}
                  to="/discharge-patient"
                >
                  <span className="btn-icon">🚪</span>
                  <span className="btn-text">Discharge Patient</span>
                  <span className="btn-arrow">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Management */}
          <Card className="management-card doctor-management">
            <CardContent className="management-card-content">
              <div className="section-header">
                <div className="section-icon-container">
                  <span className="section-icon">👨‍⚕️</span>
                </div>
                <Typography variant="h5" className="section-heading">
                  Doctor Management
                </Typography>
              </div>

              <div className="action-buttons">
                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn doctors-btn"
                  component={Link}
                  to="/all-doctors"
                >
                  <span className="btn-icon">📋</span>
                  <span className="btn-text">Registered Doctors</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn register-btn"
                  component={Link}
                  to="/register-doctor"
                >
                  <span className="btn-icon">➕</span>
                  <span className="btn-text">Register New Doctor</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn search-btn"
                  component={Link}
                  to="/search-doctor"
                >
                  <span className="btn-icon">🔍</span>
                  <span className="btn-text">Search Doctor</span>
                  <span className="btn-arrow">→</span>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  className="action-btn assign-btn"
                  component={Link}
                  to="/assign-patient"
                >
                  <span className="btn-icon">📝</span>
                  <span className="btn-text">Assign Patients</span>
                  <span className="btn-arrow">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Box>
      </div>
    </div>
  );
};

export default HospitalDashboard;