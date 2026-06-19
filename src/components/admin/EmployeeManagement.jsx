import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./admin.css";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [todayStatus, setTodayStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // ✅ NEW: Role filter
  const [actionLoading, setActionLoading] = useState({});

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employmentType: "",
    employeeField: "",
    role: "employee",
  });

  const employeeFields = [
    "Web Development", "Flutter Development", "Mobile App Development",
    "UI/UX Design", "Graphic Design", "Backend Development",
    "Frontend Development", "Full Stack Development", "DevOps Engineering",
    "Data Science", "Machine Learning", "Artificial Intelligence",
    "Cloud Computing", "Cybersecurity", "Blockchain Development",
    "Game Development", "Quality Assurance (QA)", "Project Management",
    "Business Analysis", "Digital Marketing", "SEO Specialist",
    "Content Writing", "Video Editing", "Other"
  ];

  const getToken = () => localStorage.getItem("token");

  const handleGetEmployees = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await api.get("/admin/get_employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTodayStatus = async () => {
    try {
      const token = getToken();
      const response = await api.get("/admin/get_today_status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTodayStatus(response.data.todayStatus || {});
      }
    } catch (error) {
      console.log(`Failed to fetch today status: ${error}`);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!formData.name || !formData.email || !formData.password || !formData.employmentType) {
      setErrorMsg("All fields are required"); return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters"); return;
    }
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await api.post("/admin/add_employee", {
        name: formData.name, email: formData.email, password: formData.password,
        employmentType: formData.employmentType, employeeFields: formData.employeeField,
        role: formData.role,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 201) {
        setSuccessMsg("Employee added successfully!");
        setShowAddModal(false); resetForm(); handleGetEmployees();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.status === 409 ? "Email already exists" : error.response?.data?.message || "Failed to add employee");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally { setIsLoading(false); }
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.employeeName || "", email: employee.email || "", password: "",
      employmentType: employee.employment_type || "", employeeField: employee.employee_fields || "",
      role: employee.role || "employee",
    });
    setShowEditModal(true); setErrorMsg("");
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!formData.name || !formData.email || !formData.employmentType) {
      setErrorMsg("Name, email and employment type are required"); return;
    }
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await api.put(`/admin/update_employee/${editingEmployee.id}`, {
        name: formData.name, email: formData.email, password: formData.password || undefined,
        employmentType: formData.employmentType, employeeFields: formData.employeeField,
        role: formData.role,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        setSuccessMsg("Employee updated successfully!");
        setShowEditModal(false); setEditingEmployee(null); resetForm(); handleGetEmployees();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.status === 409 ? "Email already exists" : error.response?.data?.message || "Failed to update employee");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally { setIsLoading(false); }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete "${employeeName}"?`)) return;
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await api.delete(`/admin/delete_employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setSuccessMsg(`${employeeName} deleted successfully!`);
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to delete employee");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally { setIsLoading(false); }
  };

  const handleAdminCheckIn = async (employeeId, employeeName) => {
    try {
      setActionLoading(prev => ({ ...prev, [`checkin_${employeeId}`]: true }));
      setErrorMsg(""); setSuccessMsg("");
      const token = getToken();
      const response = await api.post("/admin/employee_check_in", { employee_id: employeeId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        setSuccessMsg(`${employeeName} checked in successfully!`);
        setTodayStatus(prev => ({ ...prev, [employeeId]: { ...prev[employeeId], checked_in: true, check_in_time: new Date() } }));
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || `Failed to check in ${employeeName}`);
      setTimeout(() => setErrorMsg(""), 4000);
    } finally { setActionLoading(prev => ({ ...prev, [`checkin_${employeeId}`]: false })); }
  };

  const handleAdminCheckOut = async (employeeId, employeeName) => {
    try {
      setActionLoading(prev => ({ ...prev, [`checkout_${employeeId}`]: true }));
      setErrorMsg(""); setSuccessMsg("");
      const token = getToken();
      const response = await api.post("/admin/employee_check_out", { employee_id: employeeId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setSuccessMsg(`${employeeName} checked out successfully!`);
        setTodayStatus(prev => ({ ...prev, [employeeId]: { ...prev[employeeId], checked_out: true, check_out_time: new Date() } }));
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || `Failed to check out ${employeeName}`);
      setTimeout(() => setErrorMsg(""), 4000);
    } finally { setActionLoading(prev => ({ ...prev, [`checkout_${employeeId}`]: false })); }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", employmentType: "", employeeField: "", role: "employee" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    handleGetEmployees();
    handleGetTodayStatus();
  }, []);

  // ✅ Filter employees by search AND role
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_fields?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // ✅ Count by role
  const employeeCount = employees.filter(emp => emp.role === 'employee').length;
  const internCount = employees.filter(emp => emp.role === 'intern').length;
  const studentCount = employees.filter(emp => emp.role === 'student').length;

  return (
    <div className="admin-container">
      <div className="header-banner mb-4">
        <div className="header-content">
          <div>
            <h1 className="header-title">Employee Management 👥</h1>
            <p className="header-subtitle">Manage employees, interns, check-in/check-out</p>
          </div>
          <button className="btn-add-student" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <span className="btn-icon">➕</span> Add Employee
          </button>
        </div>
      </div>

      {successMsg && <div className="success-message"><span>✅</span> {successMsg}</div>}
      {errorMsg && <div className="error-message"><span>❌</span> {errorMsg}</div>}

      <div className="students-card">
        <div className="card-header-custom">
          <div>
            <h3 className="card-title">All Employees</h3>
            <p className="card-subtitle">
              {filteredEmployees.length} of {employees.length} members 
              ({employeeCount} employees, {internCount} interns, {studentCount} students)
            </p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." className="search-input"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {/* ✅ Role Filter Dropdown */}
            <select
              className="form-input filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Members</option>
              <option value="employee">Employees Only</option>
              <option value="intern">Interns Only</option>
              <option value="student">Students Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: "15px", color: "#888" }}>Loading...</p>
            </div>
          ) : (
            <table className="students-table employee-management-table">
              <thead>
                <tr>
                  <th className="col-emp-name">Employee</th>
                  <th className="col-emp-role">Role</th>
                  <th className="col-emp-field">Field</th>
                  <th className="col-emp-email">Email</th>
                  <th className="col-emp-type">Time</th>
                  <th className="col-emp-status">Today Status</th>
                  <th className="col-emp-attendance">Attendance</th>
                  <th className="col-emp-manage">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const empStatus = todayStatus[employee.id] || {};
                    const isCheckedIn = empStatus.checked_in;
                    const isCheckedOut = empStatus.checked_out;
                    
                    return (
                      <tr key={employee.id}>
                        <td className="col-emp-name">
                          <div className="student-info">
                            <div className="student-avatar">{employee.employeeName?.charAt(0) || 'E'}</div>
                            <span className="employee-name-text">{employee.employeeName}</span>
                          </div>
                        </td>
                        <td className="col-emp-role">
                           <span className={`role-badge role-${employee.role || 'employee'}`}>
                              {employee.role === 'intern' ? 'Intern' : 
                              employee.role === 'student' ? 'Student' : 
                              'Employee'}
                            </span>
                        </td>
                        <td className="col-emp-field">
                          <span className="field-badge">{employee.employee_fields || '—'}</span>
                        </td>
                        <td className="col-emp-email student-email">{employee.email}</td>
                        <td className="col-emp-type">
                          <span className={`type-badge type-${employee.employment_type}`}>
                            {employee.employment_type === "full_time" ? "Full" : "Half"}
                          </span>
                        </td>
                        <td className="col-emp-status">
                          {isCheckedOut ? (
                            <div>
                              <span className="status-badge status-present">✅ Done</span>
                              <div className="time-detail">
                                <small>{formatTime(empStatus.check_in_time)} - {formatTime(empStatus.check_out_time)}</small>
                              </div>
                            </div>
                          ) : isCheckedIn ? (
                            <div>
                              <span className="status-badge status-late">🟡 In</span>
                              <div className="time-detail"><small>{formatTime(empStatus.check_in_time)}</small></div>
                            </div>
                          ) : (
                            <span className="status-badge status-absent">⚪ Pending</span>
                          )}
                        </td>
                        <td className="col-emp-attendance">
                          <div className="action-buttons-group">
                            {!isCheckedOut && (
                              <>
                                <button className={`btn-action btn-checkin ${isCheckedIn ? 'btn-disabled' : ''}`}
                                  onClick={() => handleAdminCheckIn(employee.id, employee.employeeName)}
                                  disabled={isCheckedIn || actionLoading[`checkin_${employee.id}`]}>
                                  {actionLoading[`checkin_${employee.id}`] ? <span className="mini-spinner"></span> : isCheckedIn ? "✓ In" : "In"}
                                </button>
                                {isCheckedIn && (
                                  <button className="btn-action btn-checkout"
                                    onClick={() => handleAdminCheckOut(employee.id, employee.employeeName)}
                                    disabled={actionLoading[`checkout_${employee.id}`]}>
                                    {actionLoading[`checkout_${employee.id}`] ? <span className="mini-spinner"></span> : "Out"}
                                  </button>
                                )}
                              </>
                            )}
                            {isCheckedOut && <span className="completed-text">✓</span>}
                          </div>
                        </td>
                        <td className="col-emp-manage">
                          <div className="manage-buttons">
                            <button className="btn-action btn-edit" onClick={() => handleOpenEditModal(employee)} title="Edit">✏️</button>
                            <button className="btn-action btn-delete" onClick={() => handleDeleteEmployee(employee.id, employee.employeeName)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="empty-state">
                    <td colSpan="8">
                      <div className="empty-state-content">
                        <div className="empty-icon">👥</div>
                        <p className="empty-text">No members found</p>
                        <p className="empty-subtext">
                          {roleFilter !== "all" ? `No ${roleFilter}s found` : 'Click "Add Employee" to get started.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD MODAL - same as before */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div><h3 className="modal-title">Add New Employee</h3><p className="modal-subtitle">Create a new employee account</p></div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body-custom">
              <form onSubmit={handleAddEmployee}>
                <div className="form-row">
                  <div className="form-group form-group-half">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} placeholder="e.g., John Doe" required />
                  </div>
                  <div className="form-group form-group-half">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} placeholder="employee@company.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-half">
                    <label className="form-label">Employment Type</label>
                    <select name="employmentType" className="form-input" value={formData.employmentType} onChange={handleInputChange} required>
                      <option value="">Select type</option>
                      <option value="full_time">Full Time</option>
                      <option value="half_time">Half Time</option>
                    </select>
                  </div>
                  <div className="form-group form-group-half">
                    <label className="form-label">Role</label>
                    <select name="role" className="form-input" value={formData.role} onChange={handleInputChange} required>
                      <option value="employee">Employee</option>
                      <option value="intern">Intern</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Field</label>
                  <select name="employeeField" className="form-input" value={formData.employeeField} onChange={handleInputChange}>
                    <option value="">Select field (optional)</option>
                    {employeeFields.map((field, index) => (<option key={index} value={field}>{field}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-input password-input" value={formData.password} onChange={handleInputChange} placeholder="Min 6 characters" required />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Employee"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - same as before */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div><h3 className="modal-title">Edit Employee</h3><p className="modal-subtitle">Update employee information</p></div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body-custom">
              <form onSubmit={handleUpdateEmployee}>
                <div className="form-row">
                  <div className="form-group form-group-half">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group form-group-half">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-half">
                    <label className="form-label">Employment Type</label>
                    <select name="employmentType" className="form-input" value={formData.employmentType} onChange={handleInputChange} required>
                      <option value="">Select type</option>
                      <option value="full_time">Full Time</option>
                      <option value="half_time">Half Time</option>
                    </select>
                  </div>
                  <div className="form-group form-group-half">
                    <label className="form-label">Role</label>
                    <select name="role" className="form-input" value={formData.role} onChange={handleInputChange} required>
                      <option value="employee">Employee</option>
                      <option value="intern">Intern</option>
                      <option value="student">Student</option>  
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Field</label>
                  <select name="employeeField" className="form-input" value={formData.employeeField} onChange={handleInputChange}>
                    <option value="">Select field (optional)</option>
                    {employeeFields.map((field, index) => (<option key={index} value={field}>{field}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-input password-input" value={formData.password} onChange={handleInputChange} placeholder="Leave blank to keep current" />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update Employee"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;