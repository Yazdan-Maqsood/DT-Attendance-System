import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import API_URL from "../../constants/api_url";
import "./auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMsg("");

  try {
    setIsLoading(true);
    const response = await axios.post(
      `${API_URL}/auth/login`,
      formData,
      { withCredentials: true }
    );

    if (response.status === 200) {
      const userData = response.data.user;
      const token = response.data.token;  // GET THE TOKEN
      
      // Save both user data and token
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);  // SAVE THE TOKEN
      
      onLoginSuccess(userData);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      setErrorMsg("Invalid email or password");
    } else {
      setErrorMsg(error.response?.data?.message || "Login failed");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back 👋</h2>
          <p className="auth-subtitle">Sign in to your attendance portal</p>
        </div>

        <div className="auth-body">
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
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

            <div className="form-group">
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
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <a href="/register" className="auth-link">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;