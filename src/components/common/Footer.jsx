import React from "react";
import "./common.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-icon">⏰</span>
            <h3 className="footer-title">Attendance System</h3>
            <p className="footer-description">
              Efficient employee attendance management for software houses
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-list">
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/history">Attendance History</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Features</h4>
              <ul className="footer-list">
                <li>Check In/Out</li>
                <li>Attendance Reports</li>
                <li>Employee Management</li>
                <li>Time Tracking</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-list">
                <li>
                  <span className="contact-icon">📧</span>
                  support@company.com
                </li>
                <li>
                  <span className="contact-icon">📱</span>
                  +1 (555) 123-4567
                </li>
                <li>
                  <span className="contact-icon">📍</span>
                  Tech Park, Software City
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Attendance System. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="divider">|</span>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;