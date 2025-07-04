import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Signup.css";
import vescueyeLogo from "../assets/vescueye-logo.png"; // Import Vescueye logo
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("error"); // "success", "info", "warning"

  const [formData, setFormData] = useState({
    patient: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      telephone: "",
      nic: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "patient",
    },
    doctor: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      speciality: "",
      telephone: "",
      nic: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "doctor",
    },
    hospital: {
      name: "",
      address: "",
      telephone: "",
      registrationNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validateForm = (role) => {
    const data = formData[role];
    const errors = [];

    // Password checks
    if (data.password !== data.confirmPassword)
      errors.push("Passwords don't match");
    if (data.password.length < 6)
      errors.push("Password must be at least 6 characters");

    // Telephone format check
    if (!/^\d{10}$/.test(data.telephone))
      errors.push("Telephone must be 10 digits");

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.push("Invalid email format");

    // Title should not be empty
    // if (!data.title || data.title.trim() === "")
    //   errors.push("Title is required");

    // Date of birth: must be at least 18 years ago
    if (role === "doctor" && data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const now = new Date();
      const twentyYearsAgo = new Date(
        now.getFullYear() - 18,
        now.getMonth(),
        now.getDate()
      );
      if (dob > twentyYearsAgo)
        errors.push("You must be at least 18 years old");
    }

    // Role-specific required fields
    if (role === "doctor" && !data.speciality)
      errors.push("Speciality is required");

    if (role === "hospital" && !data.registrationNumber)
      errors.push("Registration number is required");

    setSnackMessage(errors.join(", "));
    setSnackSeverity("error");
    setSnackOpen(true);

    return errors;
  };

  const handleSubmit = async (e, role) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const validationErrors = validateForm(role);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      const res = await signup(formData[role]);

      if (res.success) {
        setMessage("Signup successful! Redirecting...");
        setTimeout(() => navigate(`/${role}-dashboard`), 1500);
      } else {
        setError(res.error ? res.error : "Signup failed");
        setSnackMessage(res.error ? res.error : "Signup failed");
        setSnackSeverity("error");
        setSnackOpen(true);
      }
    } catch (error) {
      setError("Signup failed. Please try again.");
    }
  };

  const handleChange = (role, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }));
  };

  return (
    <div className="auth-container">
      <div className="signup-card">
        {/* Vescueye Logo */}
        <div className="logo-container">
          <img
            src={vescueyeLogo}
            alt="Vescueye Logo"
            className="vescueye-logo"
          />
        </div>

        <h2 className="signup-title">Sign Up</h2>

        <div className="tabs">
          {["patient", "doctor"].map((role) => (
            <button
              key={role}
              className={`tab-button ${activeTab === role ? "active" : ""}`}
              onClick={() => setActiveTab(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div>
          <form
            onSubmit={(e) => handleSubmit(e, activeTab)}
            className="signup-form"
          >
            {Object.entries(formData[activeTab]).map(([field, value]) => (
              <div key={field} className="form-group">
                {field === "title" ? (
                  <select
                    value={value}
                    onChange={(e) =>
                      handleChange(activeTab, field, e.target.value)
                    }
                    required
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                  </select>
                ) : field === "dateOfBirth" ? (
                  <input
                    type="date"
                    value={value}
                    onChange={(e) =>
                      handleChange(activeTab, field, e.target.value)
                    }
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                ) : (
                  <input
                    type={
                      field.includes("password")
                        ? showPassword
                          ? "text"
                          : "password"
                        : "text"
                    }
                    placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                    value={value}
                    onChange={(e) =>
                      handleChange(activeTab, field, e.target.value)
                    }
                    required
                    disabled={field === "role"}
                  />
                )}
              </div>
            ))}

            <div className="password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label>Show Password</label>
            </div>

            <button type="submit" className="signup-button">
              Sign Up as{" "}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </form>
        </div>

        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Signup;
