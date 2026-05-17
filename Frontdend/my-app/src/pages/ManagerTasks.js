import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const ManagerTasks = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [formData, setFormData] = useState({ title: "", description: "", project_id: "", employee_id: "", priority: "medium", deadline: "" });

  useEffect(() => {
    if (user?.id) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAll = async () => {
    try {
      const [projRes, empRes, taskRes] = await Promise.all([
        API.get(`/manager/${user.id}/projects`),
        API.get(`/manager/${user.id}/employees`),
        API.get(`/manager/${user.id}/tasks`)
      ]);
      setProjects(projRes.data);
      setEmployees(empRes.data);
      setTasks(taskRes.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/manager/tasks/${currentTask.id}`, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          deadline: formData.deadline,
          employee_id: parseInt(formData.employee_id, 10)
        });
      } else {
        await API.post(`/manager/${user.id}/tasks`, {
          title: formData.title,
          description: formData.description,
          project_id: parseInt(formData.project_id, 10),
          employee_id: parseInt(formData.employee_id, 10),
          priority: formData.priority,
          deadline: formData.deadline
        });
      }
      fetchAll();
      resetForm();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(Array.isArray(detail) ? detail.map(e => e.msg).join(", ") : detail || "Error saving task");
    }
  };

  const handleEdit = (task) => {
    setEditMode(true);
    setCurrentTask(task);
    setFormData({ title: task.title, description: task.description || "", project_id: task.project_id, employee_id: task.employee_id, priority: task.priority || "medium", deadline: task.deadline || "", status: task.status });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await API.delete(`/manager/tasks/${id}`);
      fetchAll();
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", project_id: "", employee_id: "", priority: "medium", deadline: "" });
    setShowForm(false);
    setEditMode(false);
    setCurrentTask(null);
  };

  const filteredTasks = tasks.filter(t => {
    const empMatch = filterEmployee === "all" || t.employee_id === parseInt(filterEmployee);
    const statusMatch = filterStatus === "all" || t.status === filterStatus;
    const priorityMatch = filterPriority === "all" || t.priority === filterPriority;
    return empMatch && statusMatch && priorityMatch;
  });

  const getBadge = (status) => {
    if (status === "completed") return "badge badge-completed";
    if (status === "in_progress") return "badge badge-progress";
    return "badge badge-pending";
  };

  const getPriorityColor = (p) => p === "high" ? "#e94560" : p === "medium" ? "#f59e0b" : "#888";
  const selectStyle = { padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none", cursor: "pointer" };
  const inputStyle = { width: "100%", padding: "12px 15px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="manager" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Employee Tasks</h2>
            <button className="btn-login" style={{ width: "auto", padding: "10px 20px" }}
              onClick={() => { resetForm(); setShowForm(!showForm); }}>
              {showForm ? "Cancel" : "+ Assign New Task"}
            </button>
          </div>

          {/* Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total Tasks</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{tasks.filter(t => t.status === "completed").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{tasks.filter(t => t.status === "in_progress").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{tasks.filter(t => t.status === "pending").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>High Priority</h4><p>{tasks.filter(t => t.priority === "high").length}</p></div>
          </div>

          {/* Task Form */}
          {showForm && (
            <div className="features-box" style={{ marginBottom: "25px" }}>
              <h3>{editMode ? `✏️ Edit Task: ${currentTask?.title}` : "➕ Assign New Task"}</h3>
              <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="form-group">
                    <label>Task Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Build Login API" style={inputStyle} required />
                  </div>
                  <div className="form-group">
                    <label>Assign To Employee</label>
                    {employees.length === 0 ? <p style={{ color: "#e94560", fontSize: "0.85rem" }}>No employees assigned. Ask admin.</p> : (
                      <select value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} style={inputStyle} required>
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                    )}
                  </div>
                  {!editMode && (
                    <div className="form-group">
                      <label>Select Project</label>
                      {projects.length === 0 ? <p style={{ color: "#e94560", fontSize: "0.85rem" }}>No projects assigned.</p> : (
                        <select value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} style={inputStyle} required>
                          <option value="">-- Select Project --</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={inputStyle}>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} style={inputStyle} />
                  </div>
                  {editMode && (
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                        <option value="under_review">Under Review</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the task in detail..." rows="3"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #e0e0e0" }} />
                </div>
                <button type="submit" className="btn-login" style={{ width: "auto", padding: "10px 25px", marginRight: "10px" }}>
                  {editMode ? "Update Task" : "Assign Task"}
                </button>
                <button type="button" className="btn-logout" onClick={resetForm}>Cancel</button>
              </form>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.9rem", color: "#444", fontWeight: "600" }}>Filter:</span>
            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} style={selectStyle}>
              <option value="all">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="under_review">Under Review</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={selectStyle}>
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            {(filterEmployee !== "all" || filterStatus !== "all" || filterPriority !== "all") && (
              <button onClick={() => { setFilterEmployee("all"); setFilterStatus("all"); setFilterPriority("all"); }} className="btn-logout">Clear</button>
            )}
            <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#888" }}>{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found</span>
          </div>

          {/* Tasks Table */}
          <div className="table-box">
            <h3>All Tasks ({filteredTasks.length})</h3>
            {filteredTasks.length === 0 ? (
              <p style={{ color: "#888", padding: "15px 0" }}>No tasks found.</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr><th>#</th><th>Task</th><th>Project</th><th>Employee</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, i) => (
                    <tr key={task.id}>
                      <td>{i + 1}</td>
                      <td><strong>{task.title}</strong><br /><span style={{ fontSize: "0.78rem", color: "#888" }}>{task.description?.substring(0, 50)}{task.description?.length > 50 ? "..." : ""}</span></td>
                      <td>{task.project_name}</td>
                      <td><span className="badge badge-progress">{task.employee_name}</span></td>
                      <td><span style={{ color: getPriorityColor(task.priority), fontWeight: "700", fontSize: "0.85rem", textTransform: "capitalize" }}>● {task.priority}</span></td>
                      <td>{task.deadline || "N/A"}</td>
                      <td><span className={getBadge(task.status)}>{task.status}</span></td>
                      <td>
                        <button onClick={() => handleEdit(task)} style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}>Edit</button>
                        <button onClick={() => handleDelete(task.id)} style={{ background: "#e94560", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer" }}>Delete</button>
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

export default ManagerTasks;
