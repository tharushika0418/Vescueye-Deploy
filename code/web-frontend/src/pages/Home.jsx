import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Eye, Activity, Shield, ArrowRight, Users, Award, Sparkles, CheckCircle } from "lucide-react";
import "../styles/Home.css";
// Import your logo image
import vescueyeLogo from "../assets/vescueye-logo.png";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Advanced visual assessment technology with precision tracking"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Continuous Analysis",
      description: "24/7 automated tissue viability tracking and alerts"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Clinical Safety",
      description: "Evidence-based surgical monitoring with proven outcomes"
    }
  ];

  const highlights = [
    "Real-time surgical insights",
    "Enhanced patient outcomes",
    "Seamless clinical integration"
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Enhanced Background Elements */}
      <div className="background-animation">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-circle circle-4"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isLoaded ? 'loaded' : ''}`}>
        
        {/* Header Section - Reordered */}
        <div className="header-section">
          {/* Logo first */}
          <div className="logo-container">
            <div className="logo-icon">
              <img src={vescueyeLogo} alt="Vescueye Logo" className="logo-image" />
            </div>
          </div>
          
          {/* Branding (Title and Subtitle) below the logo */}
          <h1 className="main-title">
            Vescueye
            <Sparkles className="title-accent" />
          </h1>
          
          <div className="subtitle-container">
            <p className="subtitle">Revolutionizing free flap surgery monitoring with precision and innovation</p>
            
            {/* Enhanced highlights */}
            <div className="highlights-grid">
              {highlights.map((highlight, index) => (
                <div key={index} className="highlight-item">
                  <CheckCircle className="highlight-icon" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Features Showcase */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">Advanced Monitoring Capabilities</h2>
            <p className="section-subtitle">Cutting-edge technology for superior surgical outcomes</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${currentFeature === index ? 'active' : ''}`}
              >
                <div className="feature-glow"></div>
                <div className={`feature-icon ${currentFeature === index ? 'active' : ''}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-progress">
                  <div className={`progress-bar ${currentFeature === index ? 'active' : ''}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced User Actions Section */}
        <div className="actions-section">
          {user ? (
            <div className="user-welcome-card">
              <div className="card-glow"></div>
              <div className="welcome-icon">
                <Users className="users-icon" />
              </div>
              
              <h2 className="welcome-title">
                Welcome back, {user.name || user.email}!
              </h2>
              
              <p className="welcome-subtitle">
                Ready to continue your surgical monitoring journey with enhanced precision?
              </p>
              
              <Link to={`/${user.role}-dashboard`} className="dashboard-btn">
                <Award className="award-icon" />
                <span>Access Dashboard</span>
                <ArrowRight className="arrow-icon" />
              </Link>
            </div>
          ) : (
            <div className="auth-card">
              <div className="card-glow"></div>
              <h2 className="auth-title">Experience the Future of Surgical Monitoring</h2>
              <p>
                <br />
              </p>
              <p className="auth-subtitle">
                Join leading medical professionals in revolutionizing patient care with cutting-edge monitoring technology
              </p>
              <p>
                <br />
              </p>
              <p>
                <br />
              </p>
              <p className="auth-subtitle">
                  
              </p>
              
              <div className="auth-buttons">
                <Link to="/signin" className="signin-btn">
                  <span>Sign In</span>
                  <ArrowRight className="arrow-icon" />
                </Link>
                
                <Link to="/signup" className="signup-btn">
                  <span>Get Started</span>
                  <ArrowRight className="arrow-icon" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;