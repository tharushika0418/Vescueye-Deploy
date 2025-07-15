import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";
import vescueyeLogo from "../assets/vescueye-logo.png";

// Password strength checker helper
const getPasswordStrength = (password) => {
  const criteria = [
    { regex: /.{8,}/, message: "At least 8 characters" },
    { regex: /[A-Z]/, message: "One uppercase letter" },
    { regex: /\d/, message: "One number" },
    { regex: /[@$!%*?&#]/, message: "One special character" },
  ];

  const passed = criteria.filter((c) => c.regex.test(password));
  const failedMessages = criteria
    .filter((c) => !c.regex.test(password))
    .map((c) => c.message);

  let strength = "Weak";
  if (passed.length >= 3) strength = "Medium";
  if (passed.length === 4) strength = "Strong";

  return { strength, failedMessages };
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [dobInputType, setDobInputType] = useState("text");
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    failedMessages: [],
  });

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}-dashboard`);
    }
  }, [user, navigate]);

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
  });

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        const updated = {
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            [name]: value,
          },
        };

        // Password strength update
        if (name === "password") {
          const { strength, failedMessages } = getPasswordStrength(value);
          setPasswordStrength({ strength, failedMessages });
        }

        return updated;
      });

      if (error) setError(null);
    },
    [activeTab, error]
  );

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
    if (fieldName === "dateOfBirth") {
      setDobInputType("date");
    }
  };

  const handleBlur = (fieldName, value) => {
    setFocusedField(null);
    if (fieldName === "dateOfBirth" && !value) {
      setDobInputType("text");
    }
  };

  const validateForm = useCallback(() => {
    const data = formData[activeTab];
    const errors = [];

    if (!data.firstName) errors.push("First Name is required.");
    if (!data.lastName) errors.push("Last Name is required.");
    if (!data.dateOfBirth) errors.push("Date of Birth is required.");
    if (!data.telephone) errors.push("Telephone is required.");
    if (!data.nic) errors.push("NIC is required.");
    if (!data.email) errors.push("Email is required.");
    if (!data.password) errors.push("Password is required.");
    if (!data.confirmPassword) errors.push("Confirm Password is required.");

    if (data.password !== data.confirmPassword) {
      errors.push("Passwords do not match.");
    }

    if (data.telephone && !/^\d{10}$/.test(data.telephone)) {
      errors.push("Telephone number must be 10 digits.");
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format.");
    }

    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const now = new Date();
      const eighteenYearsAgo = new Date(
        now.getFullYear() - 18,
        now.getMonth(),
        now.getDate()
      );
      if (dob > eighteenYearsAgo) {
        errors.push("You must be at least 18 years old.");
      }
    }

    if (data.password) {
      const { failedMessages } = getPasswordStrength(data.password);
      if (failedMessages.length > 0) {
        errors.push("Password is too weak. " + failedMessages.join(", "));
      }
    }

    if (activeTab === "doctor" && !data.speciality) {
      errors.push("Speciality is required.");
    }

    return errors;
  }, [formData, activeTab]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        setIsLoading(false);
        return;
      }

      try {
        const res = await signup(formData[activeTab]);
        if (res.success) {
          navigate(`/${activeTab}-dashboard`);
        } else {
          setError(res.error || "Signup failed. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, activeTab, signup, navigate, validateForm]
  );

  const getInputFieldType = useCallback(
    (field) => {
      if (field.includes("password")) {
        return showPassword ? "text" : "password";
      }
      if (field === "email") return "email";
      if (field === "telephone" || field === "nic") return "text";
      return "text";
    },
    [showPassword]
  );

  const getInputFieldIcon = useCallback(() => "", []);
  const getFieldLabel = useCallback((field) => {
    switch (field) {
      case "firstName":
        return "First Name";
      case "lastName":
        return "Last Name";
      case "dateOfBirth":
        return "Date of Birth";
      case "telephone":
        return "Telephone Number";
      case "nic":
        return "NIC";
      case "email":
        return "Email Address";
      case "password":
        return "Password";
      case "confirmPassword":
        return "Confirm Password";
      case "title":
        return "Title";
      case "speciality":
        return "Speciality";
      default:
        return field.replace(/([A-Z])/g, " $1").trim();
    }
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-container">
            <img src={vescueyeLogo} alt="Vescueye Logo" className="auth-logo" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle2">Join us today!</p>
        </div>

        <div className="auth-tabs">
          {["patient", "doctor"].map((role) => (
            <button
              key={role}
              className={`tab-button ${activeTab === role ? "active" : ""}`}
              onClick={() => {
                setActiveTab(role);
                setError(null);
                setFocusedField(null);
                setDobInputType("text");
              }}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {Object.entries(formData[activeTab]).map(([field, value]) => {
            if (field === "role") return null;
            const currentInputType =
              field === "dateOfBirth" ? dobInputType : getInputFieldType(field);
            const inputIcon = getInputFieldIcon(field);
            const fieldLabel = getFieldLabel(field);
            const hasIcon = !!inputIcon;

            return (
              <div
                key={field}
                className={`input-group ${
                  focusedField === field ? "focused" : ""
                } ${value ? "filled" : ""}`}
              >
                {field !== "dateOfBirth" && (
                  <label htmlFor={field} className="floating-label">
                    {fieldLabel}
                  </label>
                )}
                {field === "password" && value && (
                  <div
                    className={`password-strength strength-${passwordStrength.strength.toLowerCase()}`}
                  >
                    Strength: <strong>{passwordStrength.strength}</strong>
                    {passwordStrength.failedMessages.length > 0 && (
                      <ul className="password-feedback">
                        {passwordStrength.failedMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <div className="input-wrapper">
                  {hasIcon && <span className="input-icon">{inputIcon}</span>}
                  {field === "title" ? (
                    <select
                      id={field}
                      name={field}
                      value={value}
                      onChange={handleChange}
                      onFocus={() => handleFocus(field)}
                      onBlur={() => handleBlur(field)}
                      required
                      className={`auth-input ${!hasIcon ? "no-icon" : ""}`}
                    >
                      <option value="">Select Title</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                    </select>
                  ) : (
                    <input
                      type={currentInputType}
                      id={field}
                      name={field}
                      value={value}
                      onChange={handleChange}
                      onFocus={() => handleFocus(field)}
                      onBlur={() => handleBlur(field, value)}
                      required
                      className={`auth-input ${!hasIcon ? "no-icon" : ""}`}
                      autoComplete={
                        field.includes("password") ? "new-password" : "off"
                      }
                      max={
                        field === "dateOfBirth"
                          ? new Date().toISOString().split("T")[0]
                          : undefined
                      }
                      placeholder={
                        field === "dateOfBirth" && dobInputType === "text"
                          ? "      Date of Birth (MM-DD-YYYY)"
                          : ""
                      }
                    />
                  )}
                  {field.includes("password") && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    ></button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="form-options">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="custom-checkbox"
              />
              <label htmlFor="showPassword" className="checkbox-label">
                Show Password
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              `Sign Up as ${
                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              }`
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/signin" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
