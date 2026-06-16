import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/common/Navbar";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import CheckInOut from "./components/attendance/CheckInOut";
import AttendanceHistory from "./components/attendance/AttendanceHistory";
import AttendanceReport from "./components/admin/AttendanceReport";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
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
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />
          
          <Route 
            path="/register" 
            element={
              user ? (
                <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              )
            } 
          />

          {/* Employee Routes */}
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

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AttendanceReport />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} replace />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;