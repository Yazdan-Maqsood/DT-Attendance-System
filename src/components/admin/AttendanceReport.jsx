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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.log(`Something went wrong! ${error}`);
      setErrorMsg(error.response?.data?.message || "Failed to fetch employees");
    }
  };

  const handleGetAllAttendance = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      const response = await api.get("/admin/get_all_attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      dateOnly: date.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  };

  // Filter attendances based on search
  const filteredAttendances = attendances.filter((attendance) =>
    attendance.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employee_fields?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group attendances by date
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
          shortDate: attendance.check_in 
            ? formatDateTime(attendance.check_in).date
            : 'Unknown',
          records: []
        };
      }
      
      groups[dateKey].records.push(attendance);
    });
    
    // Sort by date (newest first)
    return Object.values(groups).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [filteredAttendances]);

  // Get total counts
  const totalRecords = filteredAttendances.length;
  const totalDays = groupedAttendances.length;

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
            <h1 className="header-title">Attendance Reports 👥</h1>
            <p className="header-subtitle">View all employee attendance records grouped by date</p>
          </div>
        </div>
      </div>

      <div className="students-card">
        <div className="card-header-custom">
          <div>
            <h3 className="card-title">All Attendance Records</h3>
            <p className="card-subtitle">
              Showing {totalRecords} records across {totalDays} days
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

        {errorMsg && <div className="error-message">{errorMsg}</div>}

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
                  {/* Date Separator Header */}
                  <div className="date-separator">
                    <div className="date-separator-line"></div>
                    <div className="date-separator-content">
                      <span className="date-separator-icon">📅</span>
                      <span className="date-separator-text">{group.displayDate}</span>
                      <span className="date-separator-count">
                        {group.records.length} {group.records.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <div className="date-separator-line"></div>
                  </div>

                  {/* Records Table for this date */}
                  <table className="students-table date-group-table">
                    <thead>
                      <tr>
                        <th className="col-name">Employee</th>
                        <th className="col-field">Field</th>
                        <th className="col-email">Email</th>
                        <th className="col-type">Type</th>
                        <th className="col-time">Check In</th>
                        <th className="col-time">Check Out</th>
                        <th className="col-status">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((attendance) => {
                        const checkIn = formatDateTime(attendance.check_in);
                        const checkOut = formatDateTime(attendance.check_out);
                        
                        return (
                          <tr key={attendance.id}>
                            <td className="student-name-cell">
                              <div className="student-info">
                                <div className="student-avatar">
                                  {attendance.employee_name?.charAt(0) || 'E'}
                                </div>
                                <span className="employee-name-text">{attendance.employee_name}</span>
                              </div>
                            </td>
                            <td className="field-cell">
                              <span className="field-badge">
                                {attendance.employee_fields || '—'}
                              </span>
                            </td>
                            <td className="student-email">{attendance.employee_email}</td>
                            <td className="type-cell">
                              <span className={`type-badge type-${attendance.employment_type}`}>
                                {attendance.employment_type === "full_time" ? "Full Time" : "Half Time"}
                              </span>
                            </td>
                            <td className="time-cell">
                              <span className="time-badge time-in">{checkIn.time}</span>
                            </td>
                            <td className="time-cell">
                              <span className="time-badge time-out">{checkOut.time}</span>
                            </td>
                            <td className="status-cell">
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
                <p className="empty-text">
                  {searchTerm || selectedEmployee !== "all" || selectedDate
                    ? "No matching records found"
                    : "No attendance records yet"}
                </p>
                <p className="empty-subtext">
                  {searchTerm
                    ? `No records match "${searchTerm}"`
                    : "Attendance records will appear here once employees start checking in."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;