import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/common/Navbar";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import CheckInOut from "./components/attendance/CheckInOut";
import AttendanceHistory from "./components/attendance/AttendanceHistory";
import AttendanceReport from "./components/admin/AttendanceReport";
import EmployeeManagement from "./components/admin/EmployeeManagement";
import AdminDashboard from "./components/admin/AdminDashboard";

// ✅ Safe function to get user from localStorage
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined" && stored !== "null") {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  // ✅ Use safe function
  const [user, setUser] = useState(getStoredUser());

  const handleLoginSuccess = (userData) => {
    // Your LoginForm already saves to localStorage
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <div className={user ? "main-content" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  replace
                />
              ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  replace
                />
              ) : (
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CheckInOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute adminOnly={true}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute adminOnly={true}>
                <AttendanceReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="/"
            element={
              <Navigate
                to={
                  user
                    ? user.role === "admin"
                      ? "/admin/dashboard"
                      : "/dashboard"
                    : "/login"
                }
                replace
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
