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
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const App = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Check admin status whenever user signs in
  useEffect(() => {
    if (!isLoaded || !isAuthLoaded) return;
    if (!isSignedIn) {
      setIsAdmin(false);
      return;
    }

    const verifyAdmin = async () => {
      setCheckingAdmin(true);
      try {
        const token = await getToken();
        if (!token) {
          setIsAdmin(false);
          toast.error("Authentication is still loading. Please try again.");
          return;
        }

        const res = await axios.get(`${url}/api/user/check-admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          toast.error("Access denied: You are not an admin.");
          signOut();
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
        toast.error(err.response?.data?.message || "Could not verify admin access.");
      } finally {
        setCheckingAdmin(false);
      }
    };

    verifyAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, isAuthLoaded, getToken, signOut]);

  const handleLogout = () => {
    signOut();
    toast.info("Logged out");
  };

  // Still loading Clerk
  if (!isLoaded || checkingAdmin) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#1a1a2e" }}>
        <div style={{ color: "#ff6b35", fontSize: "18px" }}>⏳ Verifying access...</div>
      </div>
    );
  }

  // Not signed in or not admin
  if (!isSignedIn || !isAdmin) {
    return (
      <div>
        <ToastContainer />
        <AdminLogin />
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
