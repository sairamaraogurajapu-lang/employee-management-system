import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

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

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const high = tasks.filter(t => t.priority === "high").length;
  const total = tasks.length || 1;
  const completedPct = Math.round((completed / total) * 100);

  const today = new Date();
  const approaching = tasks.filter(t => {
    if (!t.deadline || t.status === "completed") return false;
    const diff = (new Date(t.deadline) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 5;
  });

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
            <h2>Welcome, {user?.name} 👋</h2>
            <p>Here's your personal work summary</p>
          </div>

          {/* Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total Tasks</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{completed}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{inProgress}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{pending}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>High Priority</h4><p>{high}</p></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
            {/* Progress */}
            <div className="features-box">
              <h3>📊 My Progress</h3>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <div style={{ fontSize: "3rem", fontWeight: "700", color: "#1a1a2e" }}>{completedPct}%</div>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>Overall Completion</div>
              </div>
              <div style={{ marginTop: "10px" }}>
                {[
                  { label: "Completed", count: completed, color: "#0f5132" },
                  { label: "In Progress", count: inProgress, color: "#f59e0b" },
                  { label: "Pending", count: pending, color: "#e94560" }
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#444" }}>{item.label}</span>
                      <span style={{ fontSize: "0.82rem", color: "#888" }}>{item.count}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "8px" }}>
                      <div style={{ width: `${Math.round((item.count / total) * 100)}%`, background: item.color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadlines */}
            <div className="features-box">
              <h3>⏰ Upcoming Deadlines (5 days)</h3>
              {approaching.length === 0 ? (
                <p style={{ color: "#888", marginTop: "15px" }}>No urgent deadlines. Keep it up! ✅</p>
              ) : (
                <div style={{ marginTop: "15px" }}>
                  {approaching.map(t => {
                    const diff = Math.ceil((new Date(t.deadline) - today) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{t.title}</div>
                          <div style={{ fontSize: "0.78rem", color: "#888" }}>{t.project_name} · <span style={{ color: getPriorityColor(t.priority) }}>● {t.priority}</span></div>
                        </div>
                        <span style={{ background: diff <= 1 ? "#fde8ec" : "#fff3cd", color: diff <= 1 ? "#e94560" : "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>
                          {diff === 0 ? "Today!" : `${diff}d left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="table-box">
            <h3>🕐 My Tasks Overview</h3>
            {tasks.length === 0 ? (
              <p style={{ color: "#888", padding: "15px 0" }}>No tasks assigned yet.</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr><th>Task</th><th>Project</th><th>Manager</th><th>Priority</th><th>Deadline</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td><strong>{task.title}</strong></td>
                      <td>{task.project_name}</td>
                      <td>{task.manager_name}</td>
                      <td><span style={{ color: getPriorityColor(task.priority), fontWeight: "700", fontSize: "0.85rem", textTransform: "capitalize" }}>● {task.priority}</span></td>
                      <td>{task.deadline || "N/A"}</td>
                      <td><span className={getBadge(task.status)}>{task.status}</span></td>
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

export default EmployeeDashboard;
