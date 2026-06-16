import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import "./navbar.css";
import companyIcon from "../../assets/images/companyIcon.png";

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const isActive = (path) => {
    return location.pathname === path ? "nav-link-active" : "";
  };

  const getUserInitial = () => {
    return user?.employeeName?.charAt(0) || user?.name?.charAt(0) || 'U';
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? "navbar-scrolled" : ""}`}>
      <nav className="navbar-container">
        {/* Brand Section */}
        <Link to="/" className="navbar-brand">
           
              <img style={{width: "60px"}} src={companyIcon} alt="" />
            
          <div className="brand-text">
            <span className="brand-title">Desired Technologies</span>
            <span className="brand-subtitle">Smart Attendance System</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links desktop-only column-gap-5">
          {user?.role === "admin" ? (
            <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>
              <span className="nav-link-icon"></span>
              <span>Reports</span>
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
                <span className="nav-link-icon"></span>
                <span>Dashboard</span>
              </Link>
              <Link to="/history" className={`nav-link ${isActive("/history")}`}>
                <span className="nav-link-icon"></span>
                <span>History</span>
              </Link>
            </>
          )}
        </div>

        {/* Desktop User Actions */}
        <div className="navbar-actions desktop-only">
          <div className="user-profile">
            <div className="user-avatar-wrapper">
              <div className="user-avatar">{getUserInitial()}</div>
              <div className="user-status-dot"></div>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.employeeName || user?.name || "Guest User"}</span>
              <span className="user-role-badge">
                {user?.role === "admin" ? "Admin" : "Employee"}
              </span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout" aria-label="Logout">
            <FaSignOutAlt />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobile-menu-overlay ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(false)}
      />
      <aside className={`mobile-menu-drawer ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-user-info">
            <div className="user-avatar large">{getUserInitial()}</div>
            <h3 className="mobile-user-name">{user?.employeeName || user?.name || "Guest User"}</h3>
            <span className="mobile-user-role">
              {user?.role === "admin" ? "Administrator" : "Employee"}
            </span>
          </div>

          <nav className="mobile-links">
            {user?.role === "admin" ? (
              <Link to="/admin" className={`mobile-link ${isActive("/admin")}`}>
                <span className="mobile-link-icon"></span>
                <span>Attendance Reports</span>
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className={`mobile-link ${isActive("/dashboard")}`}>
                  <span className="mobile-link-icon"></span>
                  <span>Dashboard</span>
                </Link>
                <Link to="/history" className={`mobile-link ${isActive("/history")}`}>
                  <span className="mobile-link-icon"></span>
                  <span>My History</span>
                </Link>
              </>
            )}
          </nav>

          <div className="mobile-actions">
            <button onClick={onLogout} className="btn-logout-mobile">
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Navbar;