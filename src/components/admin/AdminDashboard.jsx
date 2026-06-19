import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalInterns: 0,
    totalStudents: 0,
    todayCheckedIn: 0,
    todayPending: 0,
    todayCompleted: 0,
    recentAttendances: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getToken = () => localStorage.getItem("token");

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleGetDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = getToken();

      // Fetch all employees
      const empResponse = await api.get("/admin/get_employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch today's status
      const statusResponse = await api.get("/admin/get_today_status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch recent attendance
      const attendanceResponse = await api.get("/admin/get_all_attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (empResponse.status === 200 && statusResponse.status === 200) {
        const employees = empResponse.data.employees || [];
        const todayStatus = statusResponse.data.todayStatus || {};
        const attendances = attendanceResponse.data.attendances || [];

        // Calculate stats
        const totalEmployees = employees.filter(emp => emp.role === "employee").length;
        const totalInterns = employees.filter(emp => emp.role === "intern").length;
        const totalStudents = employees.filter(emp => emp.role === 'student').length;

        let todayCheckedIn = 0;
        let todayCompleted = 0;
        
        Object.values(todayStatus).forEach(status => {
          if (status.checked_out) {
            todayCompleted++;
          } else if (status.checked_in) {
            todayCheckedIn++;
          }
        });

        const totalMembers = totalEmployees + totalInterns;
        const todayPending = totalMembers - todayCheckedIn - todayCompleted;

        // Get recent 5 attendances
        const recentAttendances = attendances.slice(0, 5);

        setStats({
          totalEmployees,
          totalStudents,
          totalInterns,
          totalMembers,
          todayCheckedIn,
          todayPending,
          todayCompleted,
          recentAttendances,
        });
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    handleGetDashboardData();
  }, []);

  return (
    <div className="admin-container">
      {/* Header Banner */}
      <div className="header-banner mb-4">
        <div className="header-content">
          <div>
            <h1 className="header-title">Admin Dashboard 🏠</h1>
            <p className="header-subtitle">{currentDate} | {currentTime}</p>
          </div>
        </div>
      </div>

      {errorMsg && <div className="error-message"><span>❌</span> {errorMsg}</div>}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "80px" }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "15px", color: "#888" }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.totalMembers}</h3>
                <p className="stat-label">Total Members</p>
              </div>
              <div className="stat-detail">
                <span>{stats.totalEmployees} Employees</span>
                <span>{stats.totalInterns} Interns</span>
                 <span>{stats.totalStudents} Students</span>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.todayCompleted}</h3>
                <p className="stat-label">Completed Today</p>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-icon">🟡</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.todayCheckedIn}</h3>
                <p className="stat-label">Checked In Now</p>
              </div>
            </div>

            <div className="stat-card stat-danger">
              <div className="stat-icon">⚪</div>
              <div className="stat-info">
                <h3 className="stat-number">{stats.todayPending}</h3>
                <p className="stat-label">Pending Today</p>
              </div>
            </div>
          </div>

          {/* Today's Attendance Progress */}
          <div className="students-card mb-4">
            <div className="card-header-custom">
              <div>
                <h3 className="card-title">Today's Attendance Progress</h3>
                <p className="card-subtitle">Real-time attendance tracking</p>
              </div>
            </div>
            <div className="card-body-custom">
              <div className="progress-container">
                <div className="progress-bar-wrapper">
                  <div className="progress-info">
                    <span>Completed</span>
                    <span>{stats.todayCompleted} of {stats.totalMembers}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-success"
                      style={{ width: `${stats.totalMembers > 0 ? (stats.todayCompleted / stats.totalMembers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-info">
                    <span>Checked In</span>
                    <span>{stats.todayCheckedIn} of {stats.totalMembers}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-warning"
                      style={{ width: `${stats.totalMembers > 0 ? (stats.todayCheckedIn / stats.totalMembers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-info">
                    <span>Pending</span>
                    <span>{stats.todayPending} of {stats.totalMembers}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-danger"
                      style={{ width: `${stats.totalMembers > 0 ? (stats.todayPending / stats.totalMembers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="dashboard-grid">
            {/* Quick Actions */}
            <div className="students-card">
              <div className="card-header-custom">
                <div>
                  <h3 className="card-title">Quick Actions ⚡</h3>
                  <p className="card-subtitle">Frequently used actions</p>
                </div>
              </div>
              <div className="card-body-custom">
                <div className="quick-actions">
                  <Link to="/admin/employees" className="quick-action-btn">
                    <span className="quick-action-icon">👥</span>
                    <div className="quick-action-text">
                      <strong>Manage Employees</strong>
                      <small>Add, edit, or remove members</small>
                    </div>
                    <span className="quick-action-arrow">→</span>
                  </Link>
                  <Link to="/admin/attendances" className="quick-action-btn">
                    <span className="quick-action-icon">📊</span>
                    <div className="quick-action-text">
                      <strong>View Reports</strong>
                      <small>Attendance history & records</small>
                    </div>
                    <span className="quick-action-arrow">→</span>
                  </Link>
                  <Link to="/admin/employees" className="quick-action-btn">
                    <span className="quick-action-icon">➕</span>
                    <div className="quick-action-text">
                      <strong>Add Employee</strong>
                      <small>Create new account</small>
                    </div>
                    <span className="quick-action-arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="students-card">
              <div className="card-header-custom">
                <div>
                  <h3 className="card-title">Recent Activity 🕐</h3>
                  <p className="card-subtitle">Latest attendance records</p>
                </div>
              </div>
              <div className="card-body-custom">
                {stats.recentAttendances.length > 0 ? (
                  <div className="activity-list">
                    {stats.recentAttendances.map((record, index) => (
                      <div key={record.id || index} className="activity-item">
                        <div className="activity-avatar">
                          {record.employee_name?.charAt(0) || "E"}
                        </div>
                        <div className="activity-info">
                          <span className="activity-name">{record.employee_name}</span>
                          <span className="activity-time">
                            {formatTime(record.check_in)} - {formatTime(record.check_out)}
                          </span>
                        </div>
                        <span className={`status-badge status-${record.status?.toLowerCase() || "present"}`}>
                          {record.status || "Present"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-text">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;