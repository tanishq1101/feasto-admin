import React, { useState } from "react";
import "./AdminLogin.css";

const AdminLogin = ({ onLogin, loading }) => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(form);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-header">
        <div className="admin-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">Feasto Admin</span>
        </div>
        <p className="admin-subtitle">Sign in with admin credentials to continue</p>
      </div>

      <div className="admin-login-panel">
        <h3>Admin Access</h3>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="admin@feasto.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

