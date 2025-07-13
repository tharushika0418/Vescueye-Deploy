import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";
import vescueyeLogo from "../assets/vescueye-logo.png";

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || " http://localhost:5000/api";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}-dashboard`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      
      try {
        const res = await fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (data.success) {
          login(data.token, data.user);
          navigate(`/${data.user.role}-dashboard`);
        } else {
          setError(data.message || "Invalid credentials");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, login, navigate, API_URL]
  );

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
            <label htmlFor="email" className="floating-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
                className="auth-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
            <label htmlFor="password" className="floating-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                required
                className="auth-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
              </button>
            </div>
          </div>

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
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an account? 
            <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;