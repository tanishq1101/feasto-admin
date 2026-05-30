import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add.jsx";
import List from "./pages/List/List.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AddRestaurant from "./pages/addRestaurant/addRestaurant.jsx";
import ListRestaurants from "./pages/listRestaurant/listRestaurant.jsx";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
} from "@clerk/clerk-react";
import { ChefHat } from "lucide-react";

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const App = () => {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  // Global Axios Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          const errMsg = error.response.data?.message || "";
          if (
            errMsg.toLowerCase().includes("token") ||
            errMsg.toLowerCase().includes("expired") ||
            errMsg.toLowerCase().includes("unauthorized") ||
            errMsg.toLowerCase().includes("no token")
          ) {
            toast.error("Session expired. Please sign in again.");
            await signOut();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => { axios.interceptors.response.eject(interceptor); };
  }, [signOut]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="status-screen">
        <ToastContainer />
        <div className="status-card">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, background: "var(--accent-subtle)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat size={28} color="var(--accent-primary)" />
            </div>
          </div>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <h2>Loading Feasto Admin</h2>
          <p>Please wait while we set things up...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />

      {/* Signed Out — Auth Screen */}
      <SignedOut>
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-logo">
              <ChefHat size={36} color="var(--accent-primary)" />
            </div>
            <h2>Feasto Admin</h2>
            <p>Sign in with your admin account to manage food items, restaurants, and orders.</p>
            <div className="auth-buttons">
              <SignInButton mode="modal">
                <button className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }}>
                  Create Account
                </button>
              </SignUpButton>
            </div>
            <div style={{ marginTop: 24 }}>
              <SignIn routing="hash" />
            </div>
          </div>
        </div>
      </SignedOut>

      {/* Signed In */}
      <SignedIn>
        <div className="app-layout">
          <Sidebar />
          <div className="app-content">
            <Navbar />
            <main className="page-main" style={{ marginTop: "var(--navbar-height)" }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard url={url} getToken={getToken} />} />
                <Route path="/add" element={<Add url={url} getToken={getToken} />} />
                <Route path="/list" element={<List url={url} getToken={getToken} />} />
                <Route path="/orders" element={<Orders url={url} getToken={getToken} />} />
                <Route path="/add-restaurant" element={<AddRestaurant url={url} getToken={getToken} />} />
                <Route path="/manage-restaurants" element={<ListRestaurants url={url} getToken={getToken} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default App;
