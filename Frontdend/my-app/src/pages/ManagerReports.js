import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const ManagerReports = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmp, setFilterEmp] = useState("all");

  useEffect(() => {
    if (user?.id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      const [projRes, taskRes, empRes, actRes] = await Promise.all([
        API.get(`/manager/${user.id}/projects`),
        API.get(`/manager/${user.id}/tasks`),
        API.get(`/manager/${user.id}/employees`),
        API.get(`/manager/${user.id}/reports/activity`)
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      setEmployees(empRes.data);
      setActivity(actRes.data);
    } catch (err) { console.error(err); }
  };

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const total = tasks.length || 1;
  const completedPct = Math.round((completed / total) * 100);

  const getPerf = (pct) => {
    if (pct >= 80) return { label: "Excellent", color: "#0f5132", bg: "#d1e7dd" };
    if (pct >= 60) return { label: "Good", color: "#856404", bg: "#fff3cd" };
    if (pct >= 40) return { label: "Average", color: "#f59e0b", bg: "#fff8e1" };
    if (pct > 0) return { label: "Needs Improvement", color: "#e94560", bg: "#fde8ec" };
    return { label: "No Data", color: "#888", bg: "#f0f0f0" };
  };

  const tabStyle = (tab) => ({
    padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600",
    fontSize: "0.85rem", background: activeTab === tab ? "#1a1a2e" : "#f0f0f0",
    color: activeTab === tab ? "white" : "#444", transition: "all 0.2s"
  });

  const progressBar = (pct, color = "#e94560") => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "8px", width: "100px" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: "0.8rem", color: "#888" }}>{pct}%</span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="manager" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Reports & Analytics</h2>
            <p>Team performance, project-wise and individual employee reports</p>
          </div>

          {/* Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Projects</h4><p>{projects.length}</p></div>
            <div className="card"><h4>Employees</h4><p>{employees.length}</p></div>
            <div className="card"><h4>Total Tasks</h4><p>{tasks.length}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{completed}</p></div>
            <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{inProgress}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{pending}</p></div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
            {["overview", "projects", "employees", "activity"].map(tab => (
              <button key={tab} style={tabStyle(tab)} onClick={() => { setActiveTab(tab); setSelectedEmployee(null); setSelectedProject(null); }}>
                {tab === "overview" ? "📊 Overview" : tab === "projects" ? "📁 Project-wise" : tab === "employees" ? "🧑 Employee-wise" : "📅 Date Activity"}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div className="features-box">
                  <h3>📊 Task Status Breakdown</h3>
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
                          <span style={{ fontSize: "0.85rem", color: "#888" }}>{item.count} ({Math.round((item.count / total) * 100)}%)</span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "10px" }}>
                          <div style={{ width: `${Math.round((item.count / total) * 100)}%`, background: item.color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1a1a2e" }}>{completedPct}%</div>
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>Overall Completion Rate</div>
                  </div>
                </div>

                <div className="features-box">
                  <h3>🎯 Priority Breakdown</h3>
                  <div style={{ marginTop: "15px" }}>
                    {[
                      { label: "🔴 High Priority", count: tasks.filter(t => t.priority === "high").length, color: "#e94560" },
                      { label: "🟡 Medium Priority", count: tasks.filter(t => t.priority === "medium").length, color: "#f59e0b" },
                      { label: "🟢 Low Priority", count: tasks.filter(t => t.priority === "low").length, color: "#0f5132" }
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>{item.label}</span>
                          <span style={{ fontSize: "0.85rem", color: "#888" }}>{item.count} tasks</span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "10px" }}>
                          <div style={{ width: `${Math.round((item.count / total) * 100)}%`, background: item.color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="features-box" style={{ marginTop: "15px", padding: "12px", background: "#f9f9f9" }}>
                    <h3 style={{ fontSize: "0.85rem", marginBottom: "8px" }}>💡 Team Insights</h3>
                    <ul style={{ fontSize: "0.82rem" }}>
                      <li>Leading {employees.length} employee{employees.length !== 1 ? "s" : ""} across {projects.length} project{projects.length !== 1 ? "s" : ""}</li>
                      <li>{completedPct}% overall task completion</li>
                      {blocked > 0 && <li style={{ color: "#e94560" }}>⚠️ {blocked} task{blocked > 1 ? "s" : ""} blocked</li>}
                      {completedPct === 100 && tasks.length > 0 && <li style={{ color: "#0f5132" }}>🎉 All tasks completed!</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PROJECT-WISE TAB */}
          {activeTab === "projects" && (
            <>
              <div className="table-box" style={{ marginBottom: "20px" }}>
                <h3>📁 Project-wise Report</h3>
                {projects.length === 0 ? <p style={{ color: "#888", padding: "15px 0" }}>No projects assigned.</p> : (
                  <table className="styled-table">
                    <thead>
                      <tr><th>Project</th><th>Status</th><th>Deadline</th><th>Total</th><th>Completed</th><th>In Progress</th><th>Pending</th><th>Blocked</th><th>Progress</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {projects.map(p => {
                        const pt = tasks.filter(t => t.project_id === p.id);
                        const pc = pt.filter(t => t.status === "completed").length;
                        const pi = pt.filter(t => t.status === "in_progress").length;
                        const pp = pt.filter(t => t.status === "pending").length;
                        const pb = pt.filter(t => t.status === "blocked").length;
                        const pct = pt.length > 0 ? Math.round((pc / pt.length) * 100) : 0;
                        return (
                          <tr key={p.id}>
                            <td><strong>{p.name}</strong></td>
                            <td><span className={p.status === "completed" ? "badge badge-completed" : "badge badge-progress"}>{p.status || "in_progress"}</span></td>
                            <td>{p.deadline || "N/A"}</td>
                            <td><strong>{pt.length}</strong></td>
                            <td><span className="badge badge-completed">{pc}</span></td>
                            <td><span className="badge badge-progress">{pi}</span></td>
                            <td><span className="badge badge-pending">{pp}</span></td>
                            <td>{pb}</td>
                            <td>{progressBar(pct)}</td>
                            <td>
                              <button onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : { ...p, pt, pc, pi, pp, pb, pct })}
                                style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                                {selectedProject?.id === p.id ? "Close" : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {selectedProject && (
                <div className="features-box">
                  <h3>📁 {selectedProject.name} — Detailed Report</h3>
                  <div className="cards-grid" style={{ margin: "15px 0" }}>
                    <div className="card"><h4>Total Tasks</h4><p>{selectedProject.pt.length}</p></div>
                    <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{selectedProject.pc}</p></div>
                    <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{selectedProject.pi}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{selectedProject.pp}</p></div>
                    <div className="card"><h4>Completion</h4><p>{selectedProject.pct}%</p></div>
                  </div>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "10px" }}>Tasks in this project:</h4>
                  <table className="styled-table">
                    <thead><tr><th>Task</th><th>Employee</th><th>Priority</th><th>Deadline</th><th>Status</th></tr></thead>
                    <tbody>
                      {selectedProject.pt.map(t => (
                        <tr key={t.id}>
                          <td><strong>{t.title}</strong></td>
                          <td><span className="badge badge-progress">{t.employee_name}</span></td>
                          <td><span style={{ color: t.priority === "high" ? "#e94560" : t.priority === "medium" ? "#f59e0b" : "#888", fontWeight: "700", textTransform: "capitalize" }}>● {t.priority}</span></td>
                          <td>{t.deadline || "N/A"}</td>
                          <td><span className={t.status === "completed" ? "badge badge-completed" : t.status === "in_progress" ? "badge badge-progress" : "badge badge-pending"}>{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* EMPLOYEE-WISE TAB */}
          {activeTab === "employees" && (
            <>
              <div className="table-box" style={{ marginBottom: "20px" }}>
                <h3>🧑 Individual Employee Performance</h3>
                {employees.length === 0 ? <p style={{ color: "#888", padding: "15px 0" }}>No employees assigned.</p> : (
                  <table className="styled-table">
                    <thead>
                      <tr><th>Employee</th><th>Total</th><th>Completed</th><th>In Progress</th><th>Pending</th><th>Blocked</th><th>High🔴</th><th>Rate</th><th>Performance</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => {
                        const et = tasks.filter(t => t.employee_id === emp.id);
                        const ec = et.filter(t => t.status === "completed").length;
                        const ei = et.filter(t => t.status === "in_progress").length;
                        const en = et.filter(t => t.status === "pending").length;
                        const eb = et.filter(t => t.status === "blocked").length;
                        const eh = et.filter(t => t.priority === "high").length;
                        const pct = et.length > 0 ? Math.round((ec / et.length) * 100) : 0;
                        const perf = getPerf(pct);
                        return (
                          <tr key={emp.id}>
                            <td><strong>{emp.name}</strong></td>
                            <td><strong>{et.length}</strong></td>
                            <td><span className="badge badge-completed">{ec}</span></td>
                            <td><span className="badge badge-progress">{ei}</span></td>
                            <td><span className="badge badge-pending">{en}</span></td>
                            <td>{eb}</td>
                            <td><span style={{ color: "#e94560", fontWeight: "700" }}>{eh}</span></td>
                            <td>{progressBar(pct, perf.color)}</td>
                            <td><span style={{ background: perf.bg, color: perf.color, padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>{perf.label}</span></td>
                            <td>
                              <button onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : { ...emp, et, ec, ei, en, eb, eh, pct })}
                                style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                                {selectedEmployee?.id === emp.id ? "Close" : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {selectedEmployee && (
                <div className="features-box">
                  <h3>🧑 {selectedEmployee.name}'s Detailed Report</h3>
                  <div className="cards-grid" style={{ margin: "15px 0" }}>
                    <div className="card"><h4>Total Tasks</h4><p>{selectedEmployee.et.length}</p></div>
                    <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{selectedEmployee.ec}</p></div>
                    <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{selectedEmployee.ei}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{selectedEmployee.en}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>High Priority</h4><p>{selectedEmployee.eh}</p></div>
                    <div className="card"><h4>Completion</h4><p>{selectedEmployee.pct}%</p></div>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "12px" }}>
                      <div style={{ width: `${selectedEmployee.pct}%`, background: getPerf(selectedEmployee.pct).color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ textAlign: "center", marginTop: "6px", fontSize: "0.85rem", color: "#888" }}>{selectedEmployee.pct}% completion — <strong style={{ color: getPerf(selectedEmployee.pct).color }}>{getPerf(selectedEmployee.pct).label}</strong></div>
                  </div>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "10px" }}>All tasks assigned to {selectedEmployee.name}:</h4>
                  <table className="styled-table">
                    <thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Deadline</th><th>Status</th></tr></thead>
                    <tbody>
                      {selectedEmployee.et.map(t => (
                        <tr key={t.id}>
                          <td><strong>{t.title}</strong><br /><span style={{ fontSize: "0.78rem", color: "#888" }}>{t.description}</span></td>
                          <td>{t.project_name}</td>
                          <td><span style={{ color: t.priority === "high" ? "#e94560" : t.priority === "medium" ? "#f59e0b" : "#888", fontWeight: "700", textTransform: "capitalize" }}>● {t.priority}</span></td>
                          <td>{t.deadline || "N/A"}</td>
                          <td><span className={t.status === "completed" ? "badge badge-completed" : t.status === "in_progress" ? "badge badge-progress" : "badge badge-pending"}>{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* DATE ACTIVITY TAB */}
          {activeTab === "activity" && (
            <>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap", background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>📅 Date:</label>
                  <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    style={{ padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>👤 Employee:</label>
                  <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
                    style={{ padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", outline: "none", minWidth: "160px" }}>
                    <option value="all">All Employees</option>
                    {activity?.employee_activity?.map(e => (
                      <option key={e.employee_id} value={e.employee_name}>{e.employee_name}</option>
                    ))}
                  </select>
                </div>
                {(filterDate || filterEmp !== "all") && (
                  <button onClick={() => { setFilterDate(""); setFilterEmp("all"); }} className="btn-logout">✕ Clear Filters</button>
                )}
                <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: "#888" }}>
                  {filterDate && `Showing: ${filterDate}`} {filterEmp !== "all" && `· Employee: ${filterEmp}`}
                </span>
              </div>

              {activity && (() => {
                const allTasks = Object.values(activity.date_activity).flat();
                const filtered = allTasks.filter(t => {
                  const dateMatch = !filterDate || t.assigned_date === filterDate;
                  const empMatch = filterEmp === "all" || t.employee_name === filterEmp;
                  return dateMatch && empMatch;
                });
                const grouped = {};
                filtered.forEach(t => {
                  const d = t.assigned_date || "Unknown";
                  if (!grouped[d]) grouped[d] = [];
                  grouped[d].push(t);
                });
                const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
                return (
                  <div className="table-box" style={{ marginBottom: "25px" }}>
                    <h3>📅 Date-wise Task Activity
                      <span style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#888", fontWeight: "400" }}>({filtered.length} task{filtered.length !== 1 ? "s" : ""} found)</span>
                    </h3>
                    {filtered.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📭</div>
                        <p style={{ color: "#888", fontWeight: "600" }}>
                          {filterDate && filterEmp !== "all"
                            ? `No tasks found for ${filterEmp} on ${filterDate}`
                            : filterDate ? `No tasks assigned on ${filterDate}`
                            : filterEmp !== "all" ? `No tasks assigned to ${filterEmp}`
                            : "No tasks found"}
                        </p>
                      </div>
                    ) : sortedDates.map(date => (
                      <div key={date} style={{ marginBottom: "20px" }}>
                        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", padding: "10px 16px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "white", fontWeight: "700", fontSize: "0.9rem" }}>📅 {date}</span>
                          <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem" }}>{grouped[date].length} task{grouped[date].length !== 1 ? "s" : ""}</span>
                        </div>
                        <table className="styled-table" style={{ margin: 0 }}>
                          <thead><tr><th>Employee</th><th>Task</th><th>Project</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Completed On</th></tr></thead>
                          <tbody>
                            {grouped[date].map((t, i) => (
                              <tr key={i}>
                                <td><strong>{t.employee_name}</strong></td>
                                <td>{t.title}</td>
                                <td>{t.project_name}</td>
                                <td><span style={{ color: t.priority === "high" ? "#e94560" : t.priority === "medium" ? "#f59e0b" : "#888", fontWeight: "700", textTransform: "capitalize" }}>● {t.priority}</span></td>
                                <td>{t.deadline || "N/A"}</td>
                                <td><span className={t.status === "completed" ? "badge badge-completed" : t.status === "in_progress" ? "badge badge-progress" : "badge badge-pending"}>{t.status}</span></td>
                                <td>{t.completed_date || <span style={{ color: "#888" }}>—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="table-box">
                <h3>🧑 Employee Daily Activity Summary</h3>
                {(() => {
                  const filtered = activity?.employee_activity?.filter(e =>
                    filterEmp === "all" || e.employee_name === filterEmp
                  );
                  if (!filtered || filtered.length === 0) return (
                    <p style={{ color: "#888", padding: "15px 0" }}>No employee activity found.</p>
                  );
                  return filtered.map(emp => {
                    const filteredDates = Object.keys(emp.daily_activity)
                      .filter(d => !filterDate || d === filterDate)
                      .sort((a, b) => new Date(b) - new Date(a));
                    const totalFiltered = filteredDates.reduce((sum, d) => sum + emp.daily_activity[d].length, 0);
                    return (
                      <div key={emp.employee_id} style={{ marginBottom: "25px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "12px 16px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                          <div>
                            <strong style={{ fontSize: "1rem" }}>{emp.employee_name}</strong>
                            <span style={{ marginLeft: "12px", fontSize: "0.82rem", color: "#888" }}>
                              {filterDate ? `${totalFiltered} task${totalFiltered !== 1 ? "s" : ""} on ${filterDate}` : `${emp.total_tasks} total · ${emp.completed} done · ${emp.pending} pending`}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "8px", width: "80px" }}>
                              <div style={{ width: `${emp.completion_pct}%`, background: emp.completion_pct >= 80 ? "#0f5132" : emp.completion_pct >= 50 ? "#f59e0b" : "#e94560", height: "100%", borderRadius: "10px" }} />
                            </div>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{emp.completion_pct}%</span>
                          </div>
                        </div>
                        {filteredDates.length === 0 ? (
                          <p style={{ color: "#888", fontSize: "0.85rem", marginLeft: "16px" }}>No tasks on {filterDate}.</p>
                        ) : filteredDates.map(date => (
                          <div key={date} style={{ marginLeft: "16px", marginBottom: "10px" }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f3460", marginBottom: "6px", borderBottom: "1px solid #f0f0f0", paddingBottom: "4px" }}>📅 {date} — {emp.daily_activity[date].length} task{emp.daily_activity[date].length !== 1 ? "s" : ""}</div>
                            {emp.daily_activity[date].map((t, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "white", borderRadius: "6px", marginBottom: "5px", border: "1px solid #f0f0f0" }}>
                                <div>
                                  <span style={{ fontWeight: "600", fontSize: "0.88rem" }}>{t.title}</span>
                                  <span style={{ marginLeft: "10px", fontSize: "0.78rem", color: "#888" }}>📁 {t.project_name}</span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                  <span style={{ color: t.priority === "high" ? "#e94560" : t.priority === "medium" ? "#f59e0b" : "#888", fontSize: "0.78rem", fontWeight: "700", textTransform: "capitalize" }}>● {t.priority}</span>
                                  <span className={t.status === "completed" ? "badge badge-completed" : t.status === "in_progress" ? "badge badge-progress" : "badge badge-pending"}>{t.status}</span>
                                  {t.completed_date && <span style={{ fontSize: "0.75rem", color: "#0f5132" }}>✅ {t.completed_date}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default ManagerReports;
