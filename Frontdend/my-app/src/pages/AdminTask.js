import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import API from "../api/axios";

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["pending", "in_progress", "completed", "blocked"];

const getBadge = (status) => {
  switch (status) {
    case "completed":
      return "badge badge-success";
    case "in_progress":
      return "badge badge-warning";
    case "blocked":
      return "badge badge-danger";
    case "pending":
    default:
      return "badge badge-secondary";
  }
};

const AdminTask = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // managers + employees
  const [employees, setEmployees] = useState([]); // only employees

  // for creating task
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");

  const [tasks, setTasks] = useState([]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => String(p.id) === String(selectedProjectId));
  }, [projects, selectedProjectId]);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, usersRes, tasksRes] = await Promise.all([
          API.get(`/admin/projects`),
          API.get(`/admin/users`),
          API.get(`/admin/tasks`),
        ]);

        const proj = projRes.data || [];
        const allUsers = usersRes.data || [];
        const t = tasksRes.data || [];

        setProjects(proj);
        setUsers(allUsers);
        setTasks(t);

        const emps = allUsers.filter((u) => u.role === "employee");
        setEmployees(emps);

        // default selections
        if (!selectedProjectId && proj.length > 0) setSelectedProjectId(proj[0].id);
        if (!selectedEmployeeId && emps.length > 0) setSelectedEmployeeId(emps[0].id);
      } catch (e) {
        alert("Failed to load admin task data");
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTasks = async () => {
    const res = await API.get(`/admin/tasks`);
    setTasks(res.data || []);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!selectedProjectId) return alert("Project is required");
    if (!selectedEmployeeId) return alert("Employee is required");

    try {
      // Admin can assign tasks to ANY employee. Backend will store manager_id as the manager the employee belongs to
      // (or null if unassigned) but admin has full access to select employee.
      await API.post(`/admin/tasks`, {
        title,
        description,
        project_id: Number(selectedProjectId),
        employee_id: Number(selectedEmployeeId),
        priority,
        deadline: deadline || null,
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("medium");

      await refreshTasks();
    } catch (err) {
      alert(err?.response?.data?.detail || "Error creating task");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/admin/tasks/${taskId}`);
      await refreshTasks();
    } catch (e) {
      alert("Error deleting task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/admin/tasks/${taskId}/status`, { status: newStatus });
      await refreshTasks();
    } catch (err) {
      alert(err?.response?.data?.detail || "Error updating status");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin only</h2>
        <button onClick={() => navigate("/login")} style={{ marginTop: 10 }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin • Assign Task to Any Employee</h2>

      <form onSubmit={handleCreateTask} style={{
        background: "white",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        marginBottom: 18
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          <div>
            <label>Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              rows={3}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="submit" style={{ background: "#0f3460", color: "white", border: "none", padding: "10px 16px", borderRadius: 10, cursor: "pointer" }}>
            Create Task
          </button>
          {selectedProject && <div style={{ alignSelf: "center", color: "#666" }}><b>Project:</b> {selectedProject.name}</div>}
        </div>
      </form>

      <div style={{ background: "white", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
        <h3 style={{ marginTop: 0 }}>All Tasks</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: 10 }}>Title</th>
              <th style={{ padding: 10 }}>Project</th>
              <th style={{ padding: 10 }}>Employee</th>
              <th style={{ padding: 10 }}>Manager</th>
              <th style={{ padding: 10 }}>Priority</th>
              <th style={{ padding: 10 }}>Deadline</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 12, color: "#888" }}>No tasks found.</td></tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f3f3f3" }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                  </td>
                  <td style={{ padding: 10 }}>{t.project_name}</td>
                  <td style={{ padding: 10 }}>{t.employee_name}</td>
                  <td style={{ padding: 10 }}>{t.manager_name || "Unassigned"}</td>
                  <td style={{ padding: 10, textTransform: "capitalize" }}>{t.priority}</td>
                  <td style={{ padding: 10 }}>{t.deadline || "N/A"}</td>
                  <td style={{ padding: 10 }}>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      style={{ padding: 8 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div style={{ marginTop: 6 }}><span className={getBadge(t.status)}>{t.status}</span></div>
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{ background: "#dc3545", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTask;

