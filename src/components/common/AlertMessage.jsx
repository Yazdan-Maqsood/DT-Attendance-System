import React, { useEffect } from "react";
import "./common.css";

const AlertMessage = ({ type, message, onClose, duration = 5000 }) => {
  
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          background: "#d4edda",
          color: "#155724",
          borderColor: "#c3e6cb",
          icon: "✅"
        };
      case "error":
        return {
          background: "#f8d7da",
          color: "#721c24",
          borderColor: "#f5c6cb",
          icon: "❌"
        };
      case "warning":
        return {
          background: "#fff3cd",
          color: "#856404",
          borderColor: "#ffeaa7",
          icon: "⚠️"
        };
      case "info":
        return {
          background: "#d1ecf1",
          color: "#0c5460",
          borderColor: "#bee5eb",
          icon: "ℹ️"
        };
      default:
        return {
          background: "#d4edda",
          color: "#155724",
          borderColor: "#c3e6cb",
          icon: "✅"
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div 
      className="alert-message"
      style={{
        background: styles.background,
        color: styles.color,
        borderLeft: `4px solid ${styles.borderColor}`
      }}
    >
      <div className="alert-content">
        <span className="alert-icon">{styles.icon}</span>
        <span className="alert-text">{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export default AlertMessage;