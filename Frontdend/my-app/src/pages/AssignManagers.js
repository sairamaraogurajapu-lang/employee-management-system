import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import "../App.css";

const AssignManagers = () => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [formData, setFormData] = useState({ employee_id: "", manager_id: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assignRes, userRes] = await Promise.all([
        API.get("/admin/assignments"),
        API.get("/admin/users")
      ]);
      setAssignments(assignRes.data);
      setEmployees(userRes.data.filter(u => u.role === "employee"));
      setManagers(userRes.data.filter(u => u.role === "manager"));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/admin/assignments/${currentAssignment.id}`, {
          manager_id: parseInt(formData.manager_id)
        });
      } else {
        await API.post("/admin/assignments", {
          employee_id: parseInt(formData.employee_id),
          manager_id: parseInt(formData.manager_id)
        });
      }
      fetchAll();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.detail || "Error saving assignment");
    }
  };

  const handleEdit = (assignment) => {
    setEditMode(true);
    setCurrentAssignment(assignment);
    setFormData({ employee_id: assignment.employee_id, manager_id: assignment.manager_id });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this assignment?")) {
      try {
        await API.delete(`/admin/assignments/${id}`);
        fetchAll();
      } catch (error) {
        alert("Error removing assignment");
      }
    }
  };

  const resetForm = () => {
    setFormData({ employee_id: "", manager_id: "" });
    setShowForm(false);
    setEditMode(false);
    setCurrentAssignment(null);
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 15px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none"
  };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Assign Managers</h2>
            <button
              className="btn-login"
              style={{ width: "auto", padding: "10px 20px" }}
              onClick={() => { resetForm(); setShowForm(!showForm); }}
            >
              {showForm ? "Cancel" : "+ New Assignment"}
            </button>
          </div>

          {/* stats */}
          <div className="cards-grid" style={{ marginBottom: "20px" }}>
            <div className="card">
              <h4>Total Assignments</h4>
              <p>{assignments.length}</p>
            </div>
            <div className="card">
              <h4>Total Employees</h4>
              <p>{employees.length}</p>
            </div>
            <div className="card">
              <h4>Total Managers</h4>
              <p>{managers.length}</p>
            </div>
          </div>

          {showForm && (
            <div className="features-box" style={{ marginBottom: "20px" }}>
              <h3>{editMode ? "Change Manager" : "Assign Manager to Employee"}</h3>
              <form onSubmit={handleSubmit}>
                {!editMode && (
                  <div className="form-group">
                    <label>Select Employee</label>
                    {employees.length === 0 ? (
                      <p style={{ color: "#e94560", fontSize: "0.85rem" }}>
                        No employees found. Add employees from Manage Users first.
                      </p>
                    ) : (
                      <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        style={selectStyle}
                        required
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {editMode && (
                  <div className="form-group">
                    <label>Employee</label>
                    <input
                      type="text"
                      value={currentAssignment?.employee_name}
                      disabled
                      style={{ ...selectStyle, background: "#f5f5f5", color: "#888" }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Select Manager</label>
                  {managers.length === 0 ? (
                    <p style={{ color: "#e94560", fontSize: "0.85rem" }}>
                      No managers found. Add managers from Manage Users first.
                    </p>
                  ) : (
                    <select
                      name="manager_id"
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                      style={selectStyle}
                      required
                    >
                      <option value="">-- Select Manager --</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  )}
                </div>

                <button type="submit" className="btn-login" style={{ width: "auto", padding: "10px 25px", marginRight: "10px" }}>
                  {editMode ? "Update Assignment" : "Assign Manager"}
                </button>
                <button type="button" className="btn-logout" onClick={resetForm}>Cancel</button>
              </form>
            </div>
          )}

          <div className="table-box">
            <h3>All Assignments ({assignments.length})</h3>
            {assignments.length === 0 ? (
              <p style={{ color: "#888", padding: "20px 0" }}>No assignments yet. Assign a manager to an employee!</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Manager</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, index) => (
                    <tr key={a.id}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="badge badge-pending">{a.employee_name}</span>
                      </td>
                      <td>
                        <span className="badge badge-progress">{a.manager_name}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(a)}
                          style={{ background: "#0f3460", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", cursor: "pointer", marginRight: "6px" }}
                        >
                          Change Manager
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          style={{ background: "#e94560", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignManagers;
