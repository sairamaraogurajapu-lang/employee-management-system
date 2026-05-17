import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);

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

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;

  const today = new Date();
  const approaching = projects.filter(p => {
    if (!p.deadline) return false;
    const diff = (new Date(p.deadline) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const getBadge = (status) => {
    if (status === "completed") return "badge badge-completed";
    if (status === "in_progress") return "badge badge-progress";
    if (status === "blocked") return "badge badge-pending";
    return "badge badge-pending";
  };

  const getPriorityColor = (priority) => {
    if (priority === "high") return "#e94560";
    if (priority === "medium") return "#f59e0b";
    return "#888";
  };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="manager" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Welcome, {user?.name} 👋</h2>
            <p>Here's your team's overview for today</p>
          </div>

          {/* Main Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total Projects</h4><p>{projects.length}</p></div>
            <div className="card"><h4>Total Employees</h4><p>{employees.length}</p></div>
            <div className="card"><h4>Total Tasks</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{completed}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{inProgress}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{pending}</p></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
            {/* Task Progress */}
            <div className="features-box">
              <h3>📊 Task Progress</h3>
              <div style={{ marginTop: "15px" }}>
                {[
                  { label: "Completed", count: completed, color: "#0f5132" },
                  { label: "In Progress", count: inProgress, color: "#f59e0b" },
                  { label: "Pending", count: pending, color: "#e94560" },
                  { label: "Blocked", count: blocked, color: "#6c757d" }
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>{item.label}</span>
                      <span style={{ fontSize: "0.85rem", color: "#888" }}>{item.count} / {tasks.length}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "10px" }}>
                      <div style={{ width: tasks.length > 0 ? `${Math.round((item.count / tasks.length) * 100)}%` : "0%", background: item.color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadlines Approaching */}
            <div className="features-box">
              <h3>⏰ Deadlines Approaching (7 days)</h3>
              {approaching.length === 0 ? (
                <p style={{ color: "#888", marginTop: "15px" }}>No deadlines in the next 7 days.</p>
              ) : (
                <div style={{ marginTop: "15px" }}>
                  {approaching.map(p => {
                    const diff = Math.ceil((new Date(p.deadline) - today) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{p.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#888" }}>Deadline: {p.deadline}</div>
                        </div>
                        <span style={{ background: diff <= 2 ? "#fde8ec" : "#fff3cd", color: diff <= 2 ? "#e94560" : "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>
                          {diff === 0 ? "Today!" : `${diff} day${diff > 1 ? "s" : ""} left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Employee Performance */}
          <div className="table-box" style={{ marginBottom: "25px" }}>
            <h3>👥 Employee Performance</h3>
            {employees.length === 0 ? (
              <p style={{ color: "#888", padding: "15px 0" }}>No employees assigned yet.</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr><th>Employee</th><th>Total Tasks</th><th>Completed</th><th>In Progress</th><th>Pending</th><th>Performance</th></tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const et = tasks.filter(t => t.employee_id === emp.id);
                    const ec = et.filter(t => t.status === "completed").length;
                    const ep = et.filter(t => t.status === "in_progress").length;
                    const en = et.filter(t => t.status === "pending").length;
                    const pct = et.length > 0 ? Math.round((ec / et.length) * 100) : 0;
                    const perf = pct >= 80 ? "Excellent" : pct >= 50 ? "Good" : pct > 0 ? "Average" : "No Data";
                    const perfColor = pct >= 80 ? "#0f5132" : pct >= 50 ? "#856404" : "#e94560";
                    return (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{et.length}</td>
                        <td><span className="badge badge-completed">{ec}</span></td>
                        <td><span className="badge badge-progress">{ep}</span></td>
                        <td><span className="badge badge-pending">{en}</span></td>
                        <td><span style={{ color: perfColor, fontWeight: "600", fontSize: "0.85rem" }}>{perf} ({pct}%)</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="table-box">
            <h3>🕐 Recent Tasks</h3>
            {tasks.length === 0 ? (
              <p style={{ color: "#888", padding: "15px 0" }}>No tasks assigned yet.</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr><th>Task</th><th>Project</th><th>Employee</th><th>Priority</th><th>Deadline</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {tasks.slice(-10).reverse().map(task => (
                    <tr key={task.id}>
                      <td><strong>{task.title}</strong></td>
                      <td>{task.project_name}</td>
                      <td>{task.employee_name}</td>
                      <td><span style={{ color: getPriorityColor(task.priority), fontWeight: "600", fontSize: "0.85rem", textTransform: "capitalize" }}>● {task.priority}</span></td>
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

export default ManagerDashboard;
