import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import "../App.css";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    deadline: ""
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/admin/projects");
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/admin/projects/${currentProject.id}`, formData);
      } else {
        await API.post("/admin/projects", formData);
      }
      fetchProjects();
      resetForm();
    } catch (error) {
      alert("Error saving project");
    }
  };

  const handleEdit = (project) => {
    setEditMode(true);
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      manager: project.manager,
      deadline: project.deadline
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/admin/projects/${id}`);
        fetchProjects();
      } catch (error) {
        alert("Error deleting project");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", manager: "", deadline: "" });
    setShowForm(false);
    setEditMode(false);
    setCurrentProject(null);
  };

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Manage Projects</h2>
            <button className="btn-login" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Add New Project"}
            </button>
          </div>

          {showForm && (
            <div className="features-box" style={{ marginBottom: "20px" }}>
              <h3>{editMode ? "Edit Project" : "Create New Project"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #e0e0e0" }}
                  />
                </div>
                <div className="form-group">
                  <label>Assign Manager</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn-login" style={{ marginRight: "10px" }}>
                  {editMode ? "Update Project" : "Create Project"}
                </button>
                <button type="button" className="btn-logout" onClick={resetForm}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          <div className="table-box">
            <h3>All Projects</h3>
            {projects.length === 0 ? (
              <p style={{ color: "#888", padding: "20px 0" }}>No projects found. Create your first project!</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Manager</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.description || "N/A"}</td>
                      <td>{project.manager || "Unassigned"}</td>
                      <td>{project.deadline || "N/A"}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(project)}
                          style={{
                            background: "#0f3460",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "5px"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          style={{
                            background: "#e94560",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer"
                          }}
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

export default ManageProjects;
