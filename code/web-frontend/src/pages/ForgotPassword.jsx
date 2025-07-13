import { useState, useCallback } from "react";
import vescueyeLogo from "../assets/vescueye-logo.png"; // Make sure this path is correct
import { Link } from "react-router-dom"; // Import Link for "Back to Sign In"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [focusedField, setFocusedField] = useState(null); // New state for input focus

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    setEmail(e.target.value);
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
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.success) {
          setMessage("Password reset link sent! Check your email.");
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
      } catch (err) {
        setError("Unable to send reset link. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, API_URL]
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
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle2">Enter your email to reset your password</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="success-container"> {/* Use a new class for success messages */}
            <div className="success-icon">✔️</div> {/* Add a success icon */}
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
              focusedField === "email" ? "focused" : ""
            } ${email ? "filled" : ""}`}
          >
            <label htmlFor="email" className="floating-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                required
                className="auth-input"
                autoComplete="email"
              />
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
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Remembered your password?{" "}
            <Link to="/signin" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;