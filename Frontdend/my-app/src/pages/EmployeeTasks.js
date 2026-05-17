import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const EmployeeTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    if (user?.id) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/employee/${user.id}/tasks`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await API.get(`/employee/${user.id}/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch (err) { console.error(err); }
  };

  const openTask = (task) => {
    setSelectedTask(task);
    fetchComments(task.id);
    setNewComment("");
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/employee/${user.id}/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
      if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status: newStatus });
    } catch (err) { alert("Error updating status"); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await API.post(`/employee/${user.id}/tasks/${selectedTask.id}/comments`, { comment: newComment });
      setNewComment("");
      fetchComments(selectedTask.id);
    } catch (err) { alert("Error adding comment"); }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      await API.delete(`/employee/${user.id}/comments/${commentId}`);
      fetchComments(selectedTask.id);
    }
  };

  const getBadge = (status) => {
    if (status === "completed") return "badge badge-completed";
    if (status === "in_progress") return "badge badge-progress";
    return "badge badge-pending";
  };

  const getPriorityColor = (p) => p === "high" ? "#e94560" : p === "medium" ? "#f59e0b" : "#888";

  const filteredTasks = tasks.filter(t => {
    const s = filterStatus === "all" || t.status === filterStatus;
    const p = filterPriority === "all" || t.priority === filterPriority;
    return s && p;
  });

  const selectStyle = { padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none", cursor: "pointer" };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="employee" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>My Tasks</h2>
            <p>View all your assigned tasks and track progress</p>
          </div>

          {/* Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{tasks.filter(t => t.status === "completed").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{tasks.filter(t => t.status === "in_progress").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{tasks.filter(t => t.status === "pending").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>High Priority</h4><p>{tasks.filter(t => t.priority === "high").length}</p></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selectedTask ? "1fr 1fr" : "1fr", gap: "20px" }}>
            {/* Tasks List */}
            <div>
              {/* Filters */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "15px", alignItems: "center", flexWrap: "wrap" }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={selectStyle}>
                  <option value="all">All Priority</option>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                {(filterStatus !== "all" || filterPriority !== "all") && (
                  <button onClick={() => { setFilterStatus("all"); setFilterPriority("all"); }} className="btn-logout">Clear</button>
                )}
              </div>

              <div className="table-box">
                <h3>Tasks ({filteredTasks.length})</h3>
                {filteredTasks.length === 0 ? (
                  <p style={{ color: "#888", padding: "15px 0" }}>No tasks found.</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr><th>Task</th><th>Project</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map(task => (
                        <tr key={task.id} style={{ background: selectedTask?.id === task.id ? "#f0f4ff" : "" }}>
                          <td><strong>{task.title}</strong><br /><span style={{ fontSize: "0.78rem", color: "#888" }}>{task.description?.substring(0, 40)}{task.description?.length > 40 ? "..." : ""}</span></td>
                          <td>{task.project_name}</td>
                          <td><span style={{ color: getPriorityColor(task.priority), fontWeight: "700", fontSize: "0.85rem", textTransform: "capitalize" }}>● {task.priority}</span></td>
                          <td>{task.deadline || "N/A"}</td>
                          <td><span className={getBadge(task.status)}>{task.status}</span></td>
                          <td>
                            <button onClick={() => openTask(task)}
                              style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Task Detail Panel */}
            {selectedTask && (
              <div>
                <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ color: "white", margin: 0, fontSize: "1rem" }}>{selectedTask.title}</h3>
                      <button onClick={() => setSelectedTask(null)} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                    </div>
                    <p style={{ color: "#aaa", margin: "8px 0 0", fontSize: "0.85rem" }}>{selectedTask.description}</p>
                  </div>

                  {/* Details */}
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                      {[
                        { label: "Project", value: selectedTask.project_name },
                        { label: "Manager", value: selectedTask.manager_name },
                        { label: "Deadline", value: selectedTask.deadline || "N/A" },
                        { label: "Priority", value: selectedTask.priority, color: getPriorityColor(selectedTask.priority) }
                      ].map(item => (
                        <div key={item.label} style={{ background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "3px" }}>{item.label}</div>
                          <div style={{ fontWeight: "600", fontSize: "0.9rem", color: item.color || "#1a1a2e", textTransform: "capitalize" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Update Status */}
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444", display: "block", marginBottom: "8px" }}>Update Status</label>
                      <select value={selectedTask.status}
                        onChange={e => handleStatusChange(selectedTask.id, e.target.value)}
                        style={{ width: "100%", padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}>
                        <option value="pending">⏳ Pending</option>
                        <option value="in_progress">🔄 In Progress</option>
                        <option value="under_review">👀 Under Review</option>
                        <option value="completed">✅ Completed</option>
                        <option value="blocked">🚫 Blocked</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" }}>💬 Progress Comments</h4>
                      <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
                        {comments.length === 0 ? (
                          <p style={{ color: "#888", fontSize: "0.85rem" }}>No comments yet. Add your progress update below.</p>
                        ) : comments.map(c => (
                          <div key={c.id} style={{ background: "#f9f9f9", borderRadius: "8px", padding: "10px", marginBottom: "8px", position: "relative" }}>
                            <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "4px" }}>{c.employee_name} · {c.created_at}</div>
                            <div style={{ fontSize: "0.9rem", color: "#333" }}>{c.comment}</div>
                            <button onClick={() => handleDeleteComment(c.id)}
                              style={{ position: "absolute", top: "8px", right: "8px", background: "transparent", border: "none", color: "#e94560", cursor: "pointer", fontSize: "0.8rem" }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px" }}>
                        <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                          placeholder="Add progress comment..." required
                          style={{ flex: 1, padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none" }} />
                        <button type="submit" className="btn-login" style={{ width: "auto", padding: "10px 16px" }}>Add</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeTasks;
