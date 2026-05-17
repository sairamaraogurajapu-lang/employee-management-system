import { useNavigate } from "react-router-dom";
import "../App.css";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h3>{role} Panel</h3>

      {role === "admin" && (
        <>
          <p onClick={() => navigate("/admin")}>🏠 Dashboard</p>
          <p onClick={() => navigate("/admin/projects")}>📁 Manage Projects</p>
          <p onClick={() => navigate("/admin/users")}>👥 Manage Users</p>
          <p onClick={() => navigate("/admin/assign-managers")}>🔗 Assign Managers</p>
          <p onClick={() => navigate("/admin/reports")}>📊 Reports</p>
        </>
      )}

      {role === "manager" && (
        <>
          <p onClick={() => navigate("/manager")}>🏠 Dashboard</p>
          <p onClick={() => navigate("/manager/projects")}>📁 Assigned Projects</p>
          <p onClick={() => navigate("/manager/tasks")}>✅ Employee Tasks</p>
          <p onClick={() => navigate("/manager/reports")}>📊 Reports</p>
        </>
      )}

      {role === "employee" && (
        <>
          <p onClick={() => navigate("/employee")}>🏠 Dashboard</p>
          <p onClick={() => navigate("/employee/tasks")}>✅ My Tasks</p>
          <p onClick={() => navigate("/employee/update-status")}>🔄 Update Status</p>
        </>
      )}
    </div>
  );
};

export default Sidebar;
