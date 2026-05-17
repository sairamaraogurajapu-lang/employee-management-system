import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../App.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notif, setNotif] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchNotifications = async () => {
    if (!user?.id || user?.role !== "employee") return;

    try {
      const res = await API.get(`/employee/${user.id}/tasks`);
      const tasks = res.data || [];

      // Notifications = only non-completed tasks
      const activeTasks = tasks.filter((t) => t.status !== "completed");
      const active = activeTasks
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.title,
          project: t.project_name,
          manager: t.manager_name,
          status: t.status,
        }));

      setNotif(active);

      // If there are no non-completed tasks, hide dropdown completely
      if (activeTasks.length === 0) setShowNotif(false);
    } catch (e) {
      setNotif([]);
      setShowNotif(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unreadCount = notif.length;

  return (
    <div className="navbar">
      <h2>Employee Management System</h2>

      <div className="navbar-user" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user?.role === "employee" && (
          <div style={{ position: "relative" }}>
            <button
              className="btn-logout"
              style={{ padding: "8px 12px", cursor: "pointer" }}
              onClick={() => {
                // Toggle only if there are active (non-completed) tasks
                if (notif.length === 0) return;
                setShowNotif((v) => !v);
              }}
              title="Task notifications"
            >
              🔔 {unreadCount}
            </button>
            {showNotif && notif.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "white",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  width: 320,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: 10,
                  zIndex: 20,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Notifications</div>
                {notif.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px 8px",
                      borderRadius: 8,
                      background: "#f9f9f9",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {n.project} · {n.manager}
                    </div>
                    <div style={{ fontSize: 12, color: "#0f3460", fontWeight: 700 }}>
                      Status: {n.status}
                    </div>
                  </div>
                ))}
                <button
                  className="btn-logout"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setShowNotif(false);
                    navigate("/employee/tasks");
                  }}
                >
                  View all tasks
                </button>
              </div>
            )}
          </div>
        )}

        <span>
          {user?.name} ({user?.role})
        </span>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;

