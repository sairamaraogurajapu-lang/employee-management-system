import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import "../App.css";

const Reports = () => {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmp, setFilterEmp] = useState("all");

  useEffect(() => { fetchReports(); fetchActivity(); }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/admin/reports");
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchActivity = async () => {
    try {
      const res = await API.get("/admin/reports/activity");
      setActivity(res.data);
    } catch (err) { console.error(err); }
  };

  if (!data) return <><Navbar /><div className="layout"><Sidebar role="admin" /><div className="main-content"><p>Loading reports...</p></div></div></>;

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

  const progressBar = (pct, color = "#e94560", height = "8px") => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ background: "#f0f0f0", borderRadius: "10px", height, width: "100px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: "0.8rem", color: "#888", minWidth: "35px" }}>{pct}%</span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Reports & Analytics</h2>
            <p>Team-wise, project-wise and individual employee performance</p>
          </div>

          {/* Overview Stats */}
          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card"><h4>Total Users</h4><p>{data.total_users}</p></div>
            <div className="card"><h4>Projects</h4><p>{data.total_projects}</p></div>
            <div className="card"><h4>Total Tasks</h4><p>{data.total_tasks}</p></div>
            <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed Tasks</h4><p>{data.total_completed_tasks}</p></div>
            <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Completion Rate</h4><p>{data.overall_completion_pct}%</p></div>
            <div className="card" style={{ borderLeftColor: data.unassigned_employees > 0 ? "#e94560" : "#0f5132" }}><h4>Unassigned</h4><p>{data.unassigned_employees}</p></div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
            {["overview", "projects", "teams", "employees", "activity"].map(tab => (
              <button key={tab} style={tabStyle(tab)} onClick={() => { setActiveTab(tab); setSelectedEmployee(null); setSelectedTeam(null); }}>
                {tab === "overview" ? "📊 Overview" : tab === "projects" ? "📁 Project-wise" : tab === "teams" ? "👥 Team-wise" : tab === "employees" ? "🧑 Employee-wise" : "📅 Date Activity"}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div className="features-box">
                  <h3>👥 User Distribution</h3>
                  <div style={{ marginTop: "15px" }}>
                    {[
                      { label: "Admins", count: data.total_admins, color: "#0f3460" },
                      { label: "Managers", count: data.total_managers, color: "#e94560" },
                      { label: "Employees", count: data.total_employees, color: "#f59e0b" }
                    ].map(item => {
                      const pct = Math.round((item.count / (data.total_users || 1)) * 100);
                      return (
                        <div key={item.label} style={{ marginBottom: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#444" }}>{item.label}</span>
                            <span style={{ fontSize: "0.85rem", color: "#888" }}>{item.count} ({pct}%)</span>
                          </div>
                          <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "10px" }}>
                            <div style={{ width: `${pct}%`, background: item.color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="features-box">
                  <h3>✅ Overall Task Completion</h3>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ fontSize: "3.5rem", fontWeight: "700", color: "#1a1a2e" }}>{data.overall_completion_pct}%</div>
                    <div style={{ fontSize: "0.9rem", color: "#888" }}>{data.total_completed_tasks} of {data.total_tasks} tasks completed</div>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "14px" }}>
                    <div style={{ width: `${data.overall_completion_pct}%`, background: "linear-gradient(90deg,#0f3460,#e94560)", height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <div className="features-box" style={{ padding: "12px", background: "#f9f9f9" }}>
                      <h3 style={{ fontSize: "0.85rem", marginBottom: "10px" }}>💡 Key Insights</h3>
                      <ul style={{ fontSize: "0.85rem" }}>
                        <li>{data.total_managers} manager{data.total_managers !== 1 ? "s" : ""} leading {data.total_employees} employee{data.total_employees !== 1 ? "s" : ""}</li>
                        <li>Manager to Employee ratio: 1:{data.total_managers > 0 ? Math.round(data.total_employees / data.total_managers) : 0}</li>
                        {data.unassigned_employees > 0 && <li style={{ color: "#e94560" }}>⚠️ {data.unassigned_employees} employees unassigned</li>}
                        {data.unassigned_employees === 0 && data.total_employees > 0 && <li style={{ color: "#0f5132" }}>✅ All employees assigned</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PROJECT-WISE TAB */}
          {activeTab === "projects" && (
            <div className="table-box">
              <h3>📁 Project-wise Report ({data.project_reports.length} projects)</h3>
              {data.project_reports.length === 0 ? <p style={{ color: "#888", padding: "15px 0" }}>No projects found.</p> : (
                <table className="styled-table">
                  <thead>
                    <tr><th>Project</th><th>Manager</th><th>Status</th><th>Deadline</th><th>Total</th><th>Completed</th><th>In Progress</th><th>Pending</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {data.project_reports.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.manager || "N/A"}</td>
                        <td><span className={p.status === "completed" ? "badge badge-completed" : "badge badge-progress"}>{p.status}</span></td>
                        <td>{p.deadline || "N/A"}</td>
                        <td><strong>{p.total_tasks}</strong></td>
                        <td><span className="badge badge-completed">{p.completed}</span></td>
                        <td><span className="badge badge-progress">{p.in_progress}</span></td>
                        <td><span className="badge badge-pending">{p.pending}</span></td>
                        <td>{progressBar(p.completion_pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TEAM-WISE TAB */}
          {activeTab === "teams" && (
            <>
              <div className="table-box" style={{ marginBottom: "20px" }}>
                <h3>👥 Team-wise Report ({data.team_reports.length} teams)</h3>
                {data.team_reports.length === 0 ? <p style={{ color: "#888", padding: "15px 0" }}>No managers found.</p> : (
                  <table className="styled-table">
                    <thead>
                      <tr><th>Manager</th><th>Employees</th><th>Projects</th><th>Total Tasks</th><th>Completed</th><th>Pending</th><th>Team Progress</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {data.team_reports.map(t => (
                        <tr key={t.manager_id}>
                          <td><strong>{t.manager_name}</strong></td>
                          <td>{t.total_employees}</td>
                          <td>{t.projects.length > 0 ? t.projects.join(", ") : "N/A"}</td>
                          <td><strong>{t.total_tasks}</strong></td>
                          <td><span className="badge badge-completed">{t.completed}</span></td>
                          <td><span className="badge badge-pending">{t.pending}</span></td>
                          <td>{progressBar(t.completion_pct)}</td>
                          <td>
                            <button onClick={() => setSelectedTeam(selectedTeam?.manager_id === t.manager_id ? null : t)}
                              style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                              {selectedTeam?.manager_id === t.manager_id ? "Close" : "View"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Team Detail */}
              {selectedTeam && (
                <div className="features-box">
                  <h3>👥 Team: {selectedTeam.manager_name}</h3>
                  <div className="cards-grid" style={{ margin: "15px 0" }}>
                    <div className="card"><h4>Employees</h4><p>{selectedTeam.total_employees}</p></div>
                    <div className="card"><h4>Total Tasks</h4><p>{selectedTeam.total_tasks}</p></div>
                    <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{selectedTeam.completed}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{selectedTeam.pending}</p></div>
                    <div className="card"><h4>Completion</h4><p>{selectedTeam.completion_pct}%</p></div>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.85rem" }}>Projects handled:</strong>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                      {selectedTeam.projects.length > 0 ? selectedTeam.projects.map(p => (
                        <span key={p} className="badge badge-progress">{p}</span>
                      )) : <span style={{ color: "#888", fontSize: "0.85rem" }}>No projects</span>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* EMPLOYEE-WISE TAB */}
          {activeTab === "employees" && (
            <>
              <div className="table-box" style={{ marginBottom: "20px" }}>
                <h3>🧑 Individual Employee Performance ({data.employee_reports.length} employees)</h3>
                {data.employee_reports.length === 0 ? <p style={{ color: "#888", padding: "15px 0" }}>No employees found.</p> : (
                  <table className="styled-table">
                    <thead>
                      <tr><th>Employee</th><th>Manager</th><th>Dept</th><th>Total</th><th>Done</th><th>Progress</th><th>Pending</th><th>High🔴</th><th>Rate</th><th>Performance</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {data.employee_reports.map(e => {
                        const perf = getPerf(e.completion_pct);
                        return (
                          <tr key={e.employee_id}>
                            <td><strong>{e.employee_name}</strong></td>
                            <td>{e.manager}</td>
                            <td>{e.department}</td>
                            <td><strong>{e.total_tasks}</strong></td>
                            <td><span className="badge badge-completed">{e.completed}</span></td>
                            <td><span className="badge badge-progress">{e.in_progress}</span></td>
                            <td><span className="badge badge-pending">{e.pending}</span></td>
                            <td><span style={{ color: "#e94560", fontWeight: "700" }}>{e.high_priority}</span></td>
                            <td>{progressBar(e.completion_pct, perf.color)}</td>
                            <td><span style={{ background: perf.bg, color: perf.color, padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>{perf.label}</span></td>
                            <td>
                              <button onClick={() => setSelectedEmployee(selectedEmployee?.employee_id === e.employee_id ? null : e)}
                                style={{ background: "#0f3460", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8rem" }}>
                                {selectedEmployee?.employee_id === e.employee_id ? "Close" : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Individual Employee Detail */}
              {selectedEmployee && (
                <div className="features-box">
                  <h3>🧑 {selectedEmployee.employee_name}'s Performance Report</h3>
                  <div className="cards-grid" style={{ margin: "15px 0" }}>
                    <div className="card"><h4>Total Tasks</h4><p>{selectedEmployee.total_tasks}</p></div>
                    <div className="card" style={{ borderLeftColor: "#0f5132" }}><h4>Completed</h4><p>{selectedEmployee.completed}</p></div>
                    <div className="card" style={{ borderLeftColor: "#f59e0b" }}><h4>In Progress</h4><p>{selectedEmployee.in_progress}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>Pending</h4><p>{selectedEmployee.pending}</p></div>
                    <div className="card" style={{ borderLeftColor: "#6c757d" }}><h4>Blocked</h4><p>{selectedEmployee.blocked}</p></div>
                    <div className="card" style={{ borderLeftColor: "#e94560" }}><h4>High Priority</h4><p>{selectedEmployee.high_priority}</p></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <div style={{ marginBottom: "10px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "#444" }}>Manager:</strong>
                        <span style={{ marginLeft: "8px", fontSize: "0.85rem" }}>{selectedEmployee.manager}</span>
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "#444" }}>Department:</strong>
                        <span style={{ marginLeft: "8px", fontSize: "0.85rem" }}>{selectedEmployee.department}</span>
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "#444" }}>Completion Rate:</strong>
                        <span style={{ marginLeft: "8px", fontSize: "0.85rem", fontWeight: "700" }}>{selectedEmployee.completion_pct}%</span>
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "#444" }}>Performance:</strong>
                        <span style={{ marginLeft: "8px", ...(() => { const p = getPerf(selectedEmployee.completion_pct); return { color: p.color, fontWeight: "700", fontSize: "0.85rem" }; })() }}>{selectedEmployee.performance}</span>
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#444", display: "block", marginBottom: "8px" }}>Projects Worked On:</strong>
                      {selectedEmployee.projects.length > 0 ? selectedEmployee.projects.map(p => (
                        <span key={p} className="badge badge-progress" style={{ marginRight: "6px", marginBottom: "6px", display: "inline-block" }}>{p}</span>
                      )) : <span style={{ color: "#888", fontSize: "0.85rem" }}>No projects</span>}
                    </div>
                  </div>
                  <div style={{ marginTop: "15px" }}>
                    <div style={{ background: "#f0f0f0", borderRadius: "10px", height: "14px" }}>
                      <div style={{ width: `${selectedEmployee.completion_pct}%`, background: getPerf(selectedEmployee.completion_pct).color, height: "100%", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ textAlign: "center", marginTop: "8px", fontSize: "0.85rem", color: "#888" }}>{selectedEmployee.completion_pct}% completion rate</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DATE ACTIVITY TAB */}
          {activeTab === "activity" && (
            <>
              {/* Filters */}
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

              {/* Date-wise Activity Table */}
              {activity && (() => {
                const allTasks = Object.values(activity.date_activity).flat();
                const filtered = allTasks.filter(t => {
                  const dateMatch = !filterDate || t.assigned_date === filterDate;
                  const empMatch = filterEmp === "all" || t.employee_name === filterEmp;
                  return dateMatch && empMatch;
                });

                // group filtered tasks by date
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
                      <span style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#888", fontWeight: "400" }}>
                        ({filtered.length} task{filtered.length !== 1 ? "s" : ""} found)
                      </span>
                    </h3>
                    {filtered.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📭</div>
                        <p style={{ color: "#888", fontWeight: "600" }}>
                          {filterDate && filterEmp !== "all"
                            ? `No tasks found for ${filterEmp} on ${filterDate}`
                            : filterDate
                            ? `No tasks assigned on ${filterDate}`
                            : filterEmp !== "all"
                            ? `No tasks assigned to ${filterEmp}`
                            : "No tasks found"}
                        </p>
                      </div>
                    ) : sortedDates.map(date => (
                      <div key={date} style={{ marginBottom: "20px" }}>
                        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", padding: "10px 16px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "white", fontWeight: "700", fontSize: "0.9rem" }}>📅 {date}</span>
                          <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem" }}>
                            {grouped[date].length} task{grouped[date].length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <table className="styled-table" style={{ margin: 0, borderRadius: "0 0 8px 8px" }}>
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

              {/* Employee Daily Summary */}
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
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1a1a2e" }}>{emp.completion_pct}%</span>
                          </div>
                        </div>
                        {filteredDates.length === 0 ? (
                          <p style={{ color: "#888", fontSize: "0.85rem", marginLeft: "16px" }}>No tasks on {filterDate}.</p>
                        ) : filteredDates.map(date => (
                          <div key={date} style={{ marginLeft: "16px", marginBottom: "10px" }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f3460", marginBottom: "6px", padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>📅 {date} — {emp.daily_activity[date].length} task{emp.daily_activity[date].length !== 1 ? "s" : ""}</div>
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

export default Reports;
