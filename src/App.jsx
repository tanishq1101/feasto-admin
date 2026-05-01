import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add.jsx";
import List from "./pages/List/List.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddRestaurant from "./pages/addRestaurant/addRestaurant.jsx";
import ListRestaurants from "./pages/listRestaurant/listRestaurant.jsx";
import AdminLogin from "./pages/AdminLogin/AdminLogin.jsx";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN_KEY = "feasto_admin_token";

const App = () => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [adminToken]);

  const getToken = async () => adminToken;

  const handleLogin = async ({ email, password }) => {
    setIsLoggingIn(true);
    try {
      const res = await axios.post(`${url}/api/user/admin/login`, { email, password });
      if (res.data?.success && res.data?.token) {
        setAdminToken(res.data.token);
        toast.success("Admin login successful");
      } else {
        toast.error(res.data?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken("");
    toast.info("Logged out");
  };

  if (!adminToken) {
    return (
      <div>
        <ToastContainer />
        <AdminLogin onLogin={handleLogin} loading={isLoggingIn} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar onLogout={handleLogout} />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add url={url} getToken={getToken} />} />
          <Route path="/list" element={<List url={url} getToken={getToken} />} />
          <Route path="/orders" element={<Orders url={url} getToken={getToken} />} />
          <Route path="/add-restaurant" element={<AddRestaurant url={url} getToken={getToken} />} />
          <Route path="/manage-restaurants" element={<ListRestaurants url={url} getToken={getToken} />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
