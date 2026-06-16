import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../constants/api_url";
import AttendanceTable from "./AttendanceTable";
import LoadingSpinner from "../common/LoadingSpinner";
import "./attendance.css";
import api from "../../services/api";  

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const handleGetHistory = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      
      const token = localStorage.getItem("token");
      const response = await api.get("/attendance/get_history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setRecords(response.data.records || []);
      }
    } catch (error) {
      console.log(`Something went wrong! ${error}`);
      setErrorMsg(error.response?.data?.message || "Failed to fetch attendance history");
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterMonth(e.target.value);
  };

  useEffect(() => {
    handleGetHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="history-container">
        <div className="header-banner mb-4">
          <div className="header-content">
            <div>
              <h1 className="header-title">Attendance History 📋</h1>
              <p className="header-subtitle">View your complete attendance records</p>
            </div>
          </div>
        </div>
        <LoadingSpinner message="Loading attendance records..." />
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="header-banner mb-4">
        <div className="header-content">
          <div>
            <h1 className="header-title">Attendance History 📋</h1>
            <p className="header-subtitle">View your complete attendance records</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="error-message">{errorMsg}</div>
      )}

      <AttendanceTable
        records={records}
        searchTerm={searchTerm}
        filterMonth={filterMonth}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default AttendanceHistory;