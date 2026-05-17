import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerProjects from "./pages/ManagerProjects";
import ManagerTasks from "./pages/ManagerTasks";
import ManagerReports from "./pages/ManagerReports";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeTasks from "./pages/EmployeeTasks";
import EmployeeUpdateStatus from "./pages/EmployeeUpdateStatus";
import ManageProjects from "./pages/ManageProjects";
import ManageUsers from "./pages/ManageUsers";
import AssignManagers from "./pages/AssignManagers";
import Reports from "./pages/Reports";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute role="admin"><ManageProjects /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/assign-managers" element={<ProtectedRoute role="admin"><AssignManagers /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />

        <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/projects" element={<ProtectedRoute role="manager"><ManagerProjects /></ProtectedRoute>} />
        <Route path="/manager/tasks" element={<ProtectedRoute role="manager"><ManagerTasks /></ProtectedRoute>} />
        <Route path="/manager/reports" element={<ProtectedRoute role="manager"><ManagerReports /></ProtectedRoute>} />

        <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/tasks" element={<ProtectedRoute role="employee"><EmployeeTasks /></ProtectedRoute>} />
        <Route path="/employee/update-status" element={<ProtectedRoute role="employee"><EmployeeUpdateStatus /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
