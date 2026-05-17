import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import "../App.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/admin/users/${currentUser.id}`, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          department: formData.department
        });
      } else {
        await API.post("/admin/users", formData);
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.detail || "Error saving user");
    }
  };

  const handleEdit = (user) => {
    setEditMode(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert("Error deleting user");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "employee", department: "" });
    setShowForm(false);
    setEditMode(false);
    setCurrentUser(null);
  };

  const getRoleBadge = (role) => {
    if (role === "admin") return "badge badge-completed";
    if (role === "manager") return "badge badge-progress";
    return "badge badge-pending";
  };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Manage Users</h2>
            <button className="btn-login" style={{ width: "auto", padding: "10px 20px" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
              {showForm ? "Cancel" : "+ Add New User"}
            </button>
          </div>

          {showForm && (
            <div className="features-box" style={{ marginBottom: "20px" }}>
              <h3>{editMode ? "Edit User" : "Add New User"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {!editMode && (
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                {editMode && (
                  <div className="form-group">
                    <label>New Password <span style={{color:"#888", fontSize:"0.8rem"}}>(leave blank to keep current)</span></label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px 15px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Engineering, HR, Sales"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn-login" style={{ width: "auto", padding: "10px 25px", marginRight: "10px" }}>
                  {editMode ? "Update User" : "Add User"}
                </button>
                <button type="button" className="btn-logout" onClick={resetForm}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          <div className="table-box">
            <h3>All Users ({users.length})</h3>
            {users.length === 0 ? (
              <p style={{ color: "#888", padding: "20px 0" }}>No users found. Add your first user!</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={getRoleBadge(user.role)}>{user.role}</span></td>
                      <td>{user.department || "N/A"}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{ background: "#0f3460", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", cursor: "pointer", marginRight: "6px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{ background: "#e94560", color: "white", border: "none", padding: "6px 14px", borderRadius: "5px", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
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

export default ManageUsers;
