import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const ManagerProjects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", progress: 0, deadline: "", description: "" });

  useEffect(() => {
    if (user?.id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get(`/manager/${user.id}/projects`),
        API.get(`/manager/${user.id}/tasks`)
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) { console.error(err); }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setEditForm({ status: project.status || "in_progress", progress: project.progress || 0, deadline: project.deadline || "", description: project.description || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/manager/${user.id}/projects/${editProject.id}`, {
        status: editForm.status,
        progress: parseInt(editForm.progress, 10),
        deadline: editForm.deadline,
        description: editForm.description
      });
      setEditProject(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error updating project");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "completed") return "badge badge-completed";
    if (status === "in_progress") return "badge badge-progress";
    if (status === "blocked") return "badge badge-pending";
    return "badge badge-pending";
  };

  const selectStyle = { width: "100%", padding: "12px 15px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="manager" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Assigned Projects</h2>
            <p>View and update your assigned projects</p>
          </div>

          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total Projects</h4><p>{projects.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{projects.filter(p => p.status === "completed").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{projects.filter(p => p.status === "in_progress").length}</p></div>
            <div className="card"><h4>Total Tasks</h4><p>{tasks.length}</p></div>
          </div>

          {projects.length === 0 ? (
            <div className="features-box"><p style={{ color: "#888" }}>No projects assigned to you yet. Contact admin.</p></div>
          ) : projects.map(project => {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const completedTasks = projectTasks.filter(t => t.status === "completed").length;
            const autoProgress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : project.progress || 0;

            return (
              <div key={project.id} style={{ marginBottom: "25px", background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                {/* Project Header */}
                <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ color: "white", margin: 0, fontSize: "1.1rem" }}>📁 {project.name}</h3>
                      <p style={{ color: "#aaa", margin: "5px 0 0", fontSize: "0.85rem" }}>{project.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className={getStatusBadge(project.status)}>{project.status || "in_progress"}</span>
                      <button onClick={() => openEdit(project)}
                        style={{ background: "#e94560", color: "white", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                        ✏️ Update
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Progress — {completedTasks}/{projectTasks.length} tasks completed</span>
                      <span style={{ color: "white", fontSize: "0.75rem" }}>{autoProgress}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", height: "8px" }}>
                      <div style={{ width: `${autoProgress}%`, background: "#e94560", height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
                    <span style={{ color: "#aaa", fontSize: "0.8rem" }}>📅 Deadline: {project.deadline || "N/A"}</span>
                    <span style={{ color: "#aaa", fontSize: "0.8rem" }}>✅ {completedTasks} done · ⏳ {projectTasks.length - completedTasks} remaining</span>
                  </div>
                </div>

                {/* Edit Form */}
                {editProject?.id === project.id && (
                  <div style={{ padding: "20px 24px", background: "#f9f9f9", borderBottom: "1px solid #e0e0e0" }}>
                    <h4 style={{ marginBottom: "15px", color: "#1a1a2e" }}>Update Project: {project.name}</h4>
                    <form onSubmit={handleUpdate}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        <div className="form-group">
                          <label>Status</label>
                          <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={selectStyle}>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                            <option value="under_review">Under Review</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Progress (%)</label>
                          <input type="number" min="0" max="100" value={editForm.progress}
                            onChange={e => setEditForm({ ...editForm, progress: e.target.value })}
                            style={{ width: "100%", padding: "12px 15px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.95rem" }} />
                        </div>
                        <div className="form-group">
                          <label>Deadline</label>
                          <input type="date" value={editForm.deadline}
                            onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
                            style={{ width: "100%", padding: "12px 15px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.95rem" }} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          rows="2" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #e0e0e0" }} />
                      </div>
                      <button type="submit" className="btn-login" style={{ width: "auto", padding: "10px 25px", marginRight: "10px" }}>Save Changes</button>
                      <button type="button" className="btn-logout" onClick={() => setEditProject(null)}>Cancel</button>
                    </form>
                  </div>
                )}

                {/* Tasks Table */}
                <div style={{ padding: "0" }}>
                  {projectTasks.length === 0 ? (
                    <p style={{ color: "#888", padding: "15px 24px", margin: 0 }}>No tasks for this project yet.</p>
                  ) : (
                    <table className="styled-table" style={{ margin: 0 }}>
                      <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Deadline</th><th>Status</th></tr></thead>
                      <tbody>
                        {projectTasks.map(task => (
                          <tr key={task.id}>
                            <td><strong>{task.title}</strong><br /><span style={{ fontSize: "0.8rem", color: "#888" }}>{task.description}</span></td>
                            <td><span className="badge badge-progress">{task.employee_name}</span></td>
                            <td><span style={{ color: task.priority === "high" ? "#e94560" : task.priority === "medium" ? "#f59e0b" : "#888", fontWeight: "600", fontSize: "0.85rem", textTransform: "capitalize" }}>● {task.priority}</span></td>
                            <td>{task.deadline || "N/A"}</td>
                            <td><span className={task.status === "completed" ? "badge badge-completed" : task.status === "in_progress" ? "badge badge-progress" : "badge badge-pending"}>{task.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ManagerProjects;
