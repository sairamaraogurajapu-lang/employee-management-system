import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const EmployeeUpdateStatus = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    if (user?.id) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/employee/${user.id}/tasks`);
      setTasks(res.data.filter(t => t.status !== "completed"));
    } catch (err) { console.error(err); }
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await API.get(`/employee/${user.id}/tasks/${taskId}/comments`);
      setComments(prev => ({ ...prev, [taskId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const toggleExpand = (task) => {
    if (expandedTask === task.id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(task.id);
      fetchComments(task.id);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/employee/${user.id}/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) { alert("Error updating status"); }
  };

  const handleAddComment = async (taskId) => {
    const comment = newComments[taskId];
    if (!comment?.trim()) return;
    try {
      await API.post(`/employee/${user.id}/tasks/${taskId}/comments`, { comment });
      setNewComments(prev => ({ ...prev, [taskId]: "" }));
      fetchComments(taskId);
    } catch (err) { alert("Error adding comment"); }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    if (window.confirm("Delete this comment?")) {
      await API.delete(`/employee/${user.id}/comments/${commentId}`);
      fetchComments(taskId);
    }
  };

  const getBadge = (status) => {
    if (status === "completed") return "badge badge-completed";
    if (status === "in_progress") return "badge badge-progress";
    return "badge badge-pending";
  };

  const getPriorityColor = (p) => p === "high" ? "#e94560" : p === "medium" ? "#f59e0b" : "#888";

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="employee" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Update Status</h2>
            <p>Update your task progress and add work comments</p>
          </div>

          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Active Tasks</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{tasks.filter(t => t.status === "in_progress").length}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{tasks.filter(t => t.status === "pending").length}</p></div>
            
          </div>

          {tasks.length === 0 ? (
            <div className="features-box">
              <p style={{ color: "#0f5132", fontWeight: "600" }}>🎉 All tasks completed! Great work!</p>
            </div>
          ) : tasks.map(task => (
            <div key={task.id} style={{ marginBottom: "15px", background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              {/* Task Row */}
              <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <strong style={{ fontSize: "1rem" }}>{task.title}</strong>
                    <span style={{ color: getPriorityColor(task.priority), fontWeight: "700", fontSize: "0.8rem", textTransform: "capitalize" }}>● {task.priority}</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#888" }}>
                    📁 {task.project_name} · 👤 {task.manager_name} · 📅 {task.deadline || "No deadline"}
                  </div>
                  {task.description && <div style={{ fontSize: "0.82rem", color: "#555", marginTop: "4px" }}>{task.description}</div>}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={getBadge(task.status)}>{task.status}</span>
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                    style={{ padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="under_review">👀 Under Review</option>
                    <option value="completed">✅ Completed</option>
                    
                  </select>
                  <button onClick={() => toggleExpand(task)}
                    style={{ background: expandedTask === task.id ? "#e94560" : "#0f3460", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                    {expandedTask === task.id ? "Close" : "💬 Comments"}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedTask === task.id && (
                <div style={{ borderTop: "1px solid #f0f0f0", padding: "18px 22px", background: "#fafafa" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" }}>💬 Progress Comments</h4>
                  <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
                    {!comments[task.id] || comments[task.id].length === 0 ? (
                      <p style={{ color: "#888", fontSize: "0.85rem" }}>No comments yet. Add your first progress update!</p>
                    ) : comments[task.id].map(c => (
                      <div key={c.id} style={{ background: "white", borderRadius: "8px", padding: "10px 14px", marginBottom: "8px", border: "1px solid #e0e0e0", position: "relative" }}>
                        <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "4px" }}>🕐 {c.created_at}</div>
                        <div style={{ fontSize: "0.9rem", color: "#333" }}>{c.comment}</div>
                        <button onClick={() => handleDeleteComment(task.id, c.id)}
                          style={{ position: "absolute", top: "8px", right: "10px", background: "transparent", border: "none", color: "#e94560", cursor: "pointer", fontSize: "0.85rem" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" value={newComments[task.id] || ""}
                      onChange={e => setNewComments(prev => ({ ...prev, [task.id]: e.target.value }))}
                      placeholder={`e.g. Completed login UI, working on dashboard...`}
                      onKeyDown={e => e.key === "Enter" && handleAddComment(task.id)}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none" }} />
                    <button onClick={() => handleAddComment(task.id)} className="btn-login" style={{ width: "auto", padding: "10px 18px" }}>Add</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EmployeeUpdateStatus;
