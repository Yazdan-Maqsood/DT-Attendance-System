import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./common.css";

const Sidebar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "sidebar-link-active" : "";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user-avatar">
          {user?.employeeName?.charAt(0) || 'U'}
        </div>
        <div className="sidebar-user-info">
          <h4 className="sidebar-user-name">{user?.employeeName}</h4>
          <span className="sidebar-user-role">
            {user?.role === "admin" ? "Administrator" : "Employee"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {user?.role === "admin" ? (
          <>
            <div className="nav-section">
              <h5 className="nav-section-title">Admin Panel</h5>
              <Link 
                to="/admin" 
                className={`sidebar-link ${isActive("/admin")}`}
              >
                <span className="sidebar-link-icon">📊</span>
                <span>Attendance Reports</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="nav-section">
              <h5 className="nav-section-title">Attendance</h5>
              <Link 
                to="/dashboard" 
                className={`sidebar-link ${isActive("/dashboard")}`}
              >
                <span className="sidebar-link-icon">🏠</span>
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/history" 
                className={`sidebar-link ${isActive("/history")}`}
              >
                <span className="sidebar-link-icon">📋</span>
                <span>My History</span>
              </Link>
            </div>
          </>
        )}

        <div className="nav-section">
          <h5 className="nav-section-title">Account</h5>
          <button className="sidebar-link logout-btn" onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}>
            <span className="sidebar-link-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">© 2024 Attendance System</p>
      </div>
    </aside>
  );
};

export default Sidebar;