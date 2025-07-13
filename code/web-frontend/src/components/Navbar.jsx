import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLinkClick = (e) => {
    // Remove focus after clicking to prevent persistent outline
    e.target.blur();
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Ensure body padding when component mounts
  useEffect(() => {
    document.body.style.paddingTop = '90px';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="heart-container">
            <svg className="heart-svg" viewBox="0 0 24 24" fill="none">
              <path
                className="heart-icon"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="logo-text">Vescueye</span>
          <div className="pulse-container">
            <svg className="pulse-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                className="pulse-line"
                d="M0,15 L15,15 L18,5 L22,25 L25,10 L28,20 L32,15 L100,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </Link>

        <ul className={`navbar-links ${isMenuOpen ? 'navbar-links-open' : ''}`}>
          <li>
            <Link to="/" onClick={handleLinkClick} className="nav-link">
              <span>Home</span>
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to={`/${user.role}-dashboard`} onClick={handleLinkClick} className="nav-link">
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="user-info">
                <span className="user-greeting">Welcome, {user.name || user.email}</span>
              </li>
              <li>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus on mouse click
                  aria-label="Logout"
                >
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signin" onClick={handleLinkClick} className="nav-link signin-link">
                  <span>Sign In</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  onClick={handleLinkClick}
                  className="signup-btn"
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus on mouse click
                >
                  <span>Sign Up</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        <button
          className={`mobile-menu-btn ${isMenuOpen ? 'mobile-menu-btn-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {isMenuOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;