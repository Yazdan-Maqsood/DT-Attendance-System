import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../services/api";  
import "./attendance.css";

const CheckInOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    handleGetTodayStatus();
    
    return () => clearInterval(timer);
  }, []);

  const handleGetTodayStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/attendance/get_status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setTodayRecord(response.data.todayRecord);
        setAttendanceStatus(response.data.status);
      }
    } catch (error) {
      console.log(`Something went wrong! ${error}`);
    }
  };

  const handleCheckIn = async () => {
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await api.post(
        "/attendance/check_in",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 201) {
        setTodayRecord(response.data.record);
        setAttendanceStatus("checked_in");
        alert("Check-in successful!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setErrorMsg("");
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await api.post(
        "/attendance/check_out",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        setTodayRecord(response.data.record);
        setAttendanceStatus("checked_out");
        alert("Check-out successful!");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="checkin-container">
      <div className="header-banner mb-4">
        <div className="header-content">
          <div>
            <h1 className="header-title">Attendance Portal ⏰</h1>
            <p className="header-subtitle">Manage your daily check-in and check-out</p>
          </div>
        </div>
      </div>

      <div className="checkin-grid">
        {/* Time Display Card */}
        <div className="time-card">
          <div className="time-display">
            <div className="current-date">{formatDate(currentTime)}</div>
            <div className="current-time">{formatTime(currentTime)}</div>
          </div>
        </div>

        {/* Action Card */}
        <div className="action-card">
          <div className="card-header-custom">
            <h3 className="card-title">Today's Attendance</h3>
            <p className="card-subtitle">
              {todayRecord ? "Your attendance record for today" : "No record yet"}
            </p>
          </div>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          {todayRecord && (
            <div className="attendance-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Check In</span>
                  <span className="detail-value check-in-time">
                    {todayRecord.check_in ? new Date(todayRecord.check_in).toLocaleTimeString() : "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Check Out</span>
                  <span className="detail-value check-out-time">
                    {todayRecord.check_out ? new Date(todayRecord.check_out).toLocaleTimeString() : "—"}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${todayRecord.status || 'present'}`}>
                    {todayRecord.status || 'Present'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {attendanceStatus !== "checked_out" && (
              <button
                className={`btn-submit ${attendanceStatus === "checked_in" ? "btn-checkout" : "btn-checkin"}`}
                onClick={attendanceStatus === "checked_in" ? handleCheckOut : handleCheckIn}
                disabled={isLoading || attendanceStatus === "checked_out"}
              >
                {isLoading
                  ? "Processing..."
                  : attendanceStatus === "checked_in"
                  ? "🔴 Check Out"
                  : "🟢 Check In"}
              </button>
            )}
            
            {attendanceStatus === "checked_out" && (
              <div className="completed-message">
                <span className="completed-icon">✅</span>
                <p>You've completed your attendance for today!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOut;