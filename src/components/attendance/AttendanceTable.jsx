import React from "react";
import "./attendance.css";

const AttendanceTable = ({ records = [], searchTerm = "", filterMonth = "", onSearchChange, onFilterChange }) => {
  
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
    };
  };

  const getWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "—";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60);
    return `${diff.toFixed(1)} hrs`;
  };

  // Check if records exists before filtering
  const filteredRecords = records && records.length > 0 ? records.filter((record) => {
    if (!record || !record.check_in) return false;
    
    const dateStr = formatDateTime(record.check_in).date.toLowerCase();
    const matchesSearch = dateStr.includes(searchTerm.toLowerCase());
    
    if (filterMonth) {
      const recordMonth = new Date(record.check_in).getMonth() + 1;
      return matchesSearch && recordMonth === parseInt(filterMonth);
    }
    
    return matchesSearch;
  }) : [];

  return (
    <div className="students-card">
      <div className="card-header-custom">
        <div>
          <h3 className="card-title">My Attendance Records</h3>
          <p className="card-subtitle">
            Showing {filteredRecords.length} of {records ? records.length : 0} records
          </p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by date..."
              className="search-input"
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>
          <select
            className="form-input filter-select"
            value={filterMonth}
            onChange={onFilterChange}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th className="col-date">Date</th>
              <th className="col-time">Check In</th>
              <th className="col-time">Check Out</th>
              <th className="col-hours">Working Hours</th>
              <th className="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const checkIn = formatDateTime(record.check_in);
                const checkOut = formatDateTime(record.check_out);
                
                return (
                  <tr key={record.id}>
                    <td className="date-cell">{checkIn.date}</td>
                    <td className="time-cell">{checkIn.time}</td>
                    <td className="time-cell">{checkOut.time}</td>
                    <td className="hours-cell">
                      <span className="hours-badge">
                        {getWorkingHours(record.check_in, record.check_out)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${record.status?.toLowerCase() || 'present'}`}>
                        {record.status || 'Present'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="empty-state">
                <td colSpan="5">
                  <div className="empty-state-content">
                    <div className="empty-icon">📅</div>
                    <p className="empty-text">
                      {searchTerm || filterMonth
                        ? "No matching records found"
                        : "No attendance records yet"}
                    </p>
                    <p className="empty-subtext">
                      {searchTerm || filterMonth
                        ? "Try different search criteria"
                        : "Start by checking in for today!"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;