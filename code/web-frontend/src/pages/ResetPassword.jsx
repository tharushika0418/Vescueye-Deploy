import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import vescueyeLogo from "../assets/vescueye-logo.png"; // Make sure this path is correct

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
  const [focusedField, setFocusedField] = useState(null); // New state for input focus

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    setPassword(e.target.value);
    // Clear messages when user starts typing
    if (message) setMessage(null);
    if (error) setError(null);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (data.success) {
          setMessage("Password reset successful! Redirecting to login...");
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
      } catch (err) {
        setError("Unable to reset password. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [password, token, navigate, API_URL]
  );

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
        {/* Logo Section */}
        <div className="auth-header">
          <div className="logo-container">
            <img src={vescueyeLogo} alt="Vescueye Logo" className="auth-logo" />
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle2">Enter your new secure password</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="success-container">
            <div className="success-icon">✔️</div>
            <p className="success-message">{message}</p>
          </div>
        )}
        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div
            className={`input-group ${
              focusedField === "password" ? "focused" : ""
            } ${password ? "filled" : ""}`}
          >
            <label htmlFor="password" className="floating-label">
              New Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                required
                className="auth-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* You can add an SVG icon here for eye open/close if needed,
                    otherwise, the CSS handles the background image */}
              </button>
            </div>
          </div>

          <div className="form-options"> {/* Added for consistency with Sign In, though only one option here */}
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
              "Reset Password"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            <Link to="/signin" className="auth-link">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;