import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../App.css";
import API from "../api/axios";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/admin/reports");
        setData(res.data);
      } catch (e) {
        // Keep UI stable if API fails
        setData(null);
      }
    };
    load();
  }, []);

  const totalUsers = data?.total_users ?? 0;
  const totalProjects = data?.total_projects ?? 0;
  const totalManagers = data?.total_managers ?? 0;
  const totalEmployees = data?.total_employees ?? 0;

  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="dashboard-header">
            <h2>Admin Dashboard</h2>
            <p>Manage your organization from one place</p>
          </div>

          <div className="cards-grid">
            <div className="card">
              <h4>Total Users</h4>
              <p>{totalUsers}</p>
            </div>
            <div className="card">
              <h4>Projects</h4>
              <p>{totalProjects}</p>
            </div>
            <div className="card">
              <h4>Managers</h4>
              <p>{totalManagers}</p>
            </div>
            <div className="card">
              <h4>Employees</h4>
              <p>{totalEmployees}</p>
            </div>
          </div>


          <div className="features-box">
            <h3>Quick Actions</h3>
            <ul>
              <li>Create & manage projects</li>
              <li>Add and remove managers</li>
              <li>Add and remove employees</li>
              <li>Assign projects to managers</li>
              <li>View all reports</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
