import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../services/api";
import "./admin.css";

const AttendanceReport = () => {
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const handleGetEmployees = async () => {
    try {
      const token = getToken();
      const response = await api.get("/admin/get_employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const handleGetAllAttendance = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      const response = await api.get("/admin/get_all_attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        setAttendances(response.data.attendances || []);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterAttendance = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      const params = {};
      if (selectedEmployee !== "all") params.employee_id = selectedEmployee;
      if (selectedDate) params.date = selectedDate;

      const response = await api.get("/admin/filter_attendance", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        setAttendances(response.data.attendances || []);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Filter failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  const getWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "—";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const totalMinutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const filteredAttendances = attendances.filter((attendance) =>
    attendance.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employee_fields?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAttendances = useMemo(() => {
    const groups = {};
    
    filteredAttendances.forEach((attendance) => {
      const dateKey = attendance.check_in 
        ? new Date(attendance.check_in).toISOString().split('T')[0]
        : 'unknown';
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          displayDate: attendance.check_in 
            ? formatDateTime(attendance.check_in).fullDate
            : 'Unknown Date',
          records: []
        };
      }
      
      groups[dateKey].records.push(attendance);
    });
    
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredAttendances]);

  const isToday = (dateString) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    handleGetEmployees();
    handleGetAllAttendance();
  }, []);

  useEffect(() => {
    if (selectedEmployee !== "all" || selectedDate) {
      handleFilterAttendance();
    } else {
      handleGetAllAttendance();
    }
  }, [selectedEmployee, selectedDate]);

  return (
    <div className="admin-container">
      <div className="header-banner mb-4">
        <div className="header-content">
          <div>
            <h1 className="header-title">Attendance Reports 📊</h1>
            <p className="header-subtitle">View all employee attendance records grouped by date</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="error-message">
          <span>❌</span> {errorMsg}
        </div>
      )}

      <div className="students-card">
        <div className="card-header-custom">
          <div>
            <h3 className="card-title">Attendance Records</h3>
            <p className="card-subtitle">
              {filteredAttendances.length} records across {groupedAttendances.length} days
            </p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email or field..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-input filter-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeName || emp.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="form-input filter-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: "15px", color: "#888" }}>Loading records...</p>
            </div>
          ) : groupedAttendances.length > 0 ? (
            <div className="grouped-records">
              {groupedAttendances.map((group) => (
                <div key={group.date} className="date-group">
                  <div className={`date-separator ${isToday(group.date) ? 'today' : ''}`}>
                    <div className="date-separator-line"></div>
                    <div className="date-separator-content">
                      <span className="date-separator-icon">📅</span>
                      <span className="date-separator-text">{group.displayDate}</span>
                      {isToday(group.date) && <span className="today-badge">Today</span>}
                      <span className="date-separator-count">
                        {group.records.length} {group.records.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <div className="date-separator-line"></div>
                  </div>

                  <table className="students-table date-group-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Field</th>
                        <th>Email</th>
                        <th>Time</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((attendance) => {
                        const checkIn = formatDateTime(attendance.check_in);
                        const checkOut = formatDateTime(attendance.check_out);
                        
                        return (
                          <tr key={attendance.id}>
                            <td>
                              <div className="student-info">
                                <div className="student-avatar">
                                  {attendance.employee_name?.charAt(0) || 'E'}
                                </div>
                                <span className="employee-name-text">{attendance.employee_name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="field-badge">{attendance.employee_fields || '—'}</span>
                            </td>
                            <td className="student-email">{attendance.employee_email}</td>
                            <td>
                              <span className={`type-badge type-${attendance.employment_type}`}>
                                {attendance.employment_type === "full_time" ? "Full" : "Half"}
                              </span>
                            </td>
                            <td>
                              <span className="time-badge time-in">{checkIn.time}</span>
                            </td>
                            <td>
                              <span className="time-badge time-out">{checkOut.time}</span>
                            </td>
                            <td>
                              <span className="hours-badge">
                                {getWorkingHours(attendance.check_in, attendance.check_out)}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge status-${attendance.status?.toLowerCase() || 'present'}`}>
                                {attendance.status || 'Present'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-icon">📊</div>
                <p className="empty-text">No attendance records found</p>
                <p className="empty-subtext">Records will appear here once employees start checking in.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;