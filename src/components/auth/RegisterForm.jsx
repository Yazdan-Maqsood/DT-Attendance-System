import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = ({ onRegisterSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employmentType: "",
    employeeField: "",  // New field
  });

  // Employee fields options
  const employeeFields = [
    "Web Development",
    "Flutter Development",
    "Mobile App Development",
    "UI/UX Design",
    "Graphic Design",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "DevOps Engineering",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain Development",
    "Game Development",
    "Quality Assurance (QA)",
    "Project Management",
    "Business Analysis",
    "Digital Marketing",
    "SEO Specialist",
    "Content Writing",
    "Video Editing",
    "Other"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    if (!formData.employeeField) {
      setErrorMsg("Please select your field");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/auth/register`, 
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employmentType: formData.employmentType,
          employeeFields: formData.employeeField,  // Send new field
        }, 
        { withCredentials: true }
      );
      
      if (response.status === 201) {
        alert("Registration successful! Please login.");
        onRegisterSuccess();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMsg("Email already registered");
      } else {
        setErrorMsg(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account ✨</h2>
          <p className="auth-subtitle">Join the attendance management system</p>
        </div>

        <div className="auth-body">
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          
          <form onSubmit={handleRegister}>
            {/* Row 1: Full Name and Email */}
            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">👤</span> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">📧</span> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Row 2: Employment Type and Employee Field */}
            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">💼</span> Employment Type
                </label>
                <select
                  name="employmentType"
                  className="form-input"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full Time</option>
                  <option value="half_time">Half Time</option>
                </select>
              </div>

              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">🚀</span> Your Field
                </label>
                <select
                  name="employeeField"
                  className="form-input"
                  value={formData.employeeField}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your field</option>
                  {employeeFields.map((field, index) => (
                    <option key={index} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Password and Confirm Password */}
            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">🔒</span> Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input password-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <div className="form-group form-group-half">
                <label className="form-label">
                  <span className="label-icon">🔒</span> Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-input password-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <a href="/login" className="auth-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;