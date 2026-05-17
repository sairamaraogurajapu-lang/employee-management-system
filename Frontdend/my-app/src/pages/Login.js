import { useContext, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      console.log("Login response:", res.data);
      const { user, access_token } = res.data;
      login(user, access_token);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/employee");
    } catch (error) {
      console.log("Login error:", error.response?.data, error.response?.status);
      alert(error.response?.data?.detail || "Invalid Credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Welcome Back 👋</h2>
        <p>Sign in to your account to continue</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
