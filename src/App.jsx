import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add.jsx";
import List from "./pages/List/List.jsx";
import Orders from "./pages/Orders/Orders.jsx";
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

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const ADMIN_STATUS = {
  checking: "checking",
  authorized: "authorized",
  forbidden: "forbidden",
  error: "error",
};

const App = () => {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();
  const [adminStatus, setAdminStatus] = useState(ADMIN_STATUS.checking);

  // Global Axios Interceptor to handle expired or invalid tokens
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
            toast.error("Session expired or invalid. Please sign in again.");
            await signOut();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [signOut]);

  // Verify backend-side admin access
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setAdminStatus(ADMIN_STATUS.checking);
      return;
    }

    let isMounted = true;

    const verifyAdminAccess = async () => {
      try {
        setAdminStatus(ADMIN_STATUS.checking);
        const token = await getToken();
        if (!token) {
          if (isMounted) setAdminStatus(ADMIN_STATUS.forbidden);
          return;
        }

        const response = await axios.get(`${url}/api/admin/restaurants/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setAdminStatus(
            response.data?.success === false
              ? ADMIN_STATUS.forbidden
              : ADMIN_STATUS.authorized
          );
        }
      } catch (error) {
        if (!isMounted) return;
        if (error.response?.status === 403 || error.response?.status === 401) {
          setAdminStatus(ADMIN_STATUS.forbidden);
        } else {
          setAdminStatus(ADMIN_STATUS.error);
        }
      }
    };

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [getToken, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div>
        <ToastContainer />
        <p style={{ padding: "1.5rem" }}>Loading admin console...</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <SignedOut>
        <div style={{ padding: "2rem", maxWidth: 480 }}>
          <h2>Admin access</h2>
          <p>Please sign in with your Clerk admin account to continue.</p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        {adminStatus === ADMIN_STATUS.checking && (
          <div style={{ padding: "1.5rem" }}>Verifying admin access...</div>
        )}

        {adminStatus === ADMIN_STATUS.forbidden && (
          <div style={{ padding: "1.5rem", maxWidth: 520 }}>
            <h2>Admin access required</h2>
            <p>
              Your account is signed in, but it does not have admin permissions in the backend.
            </p>
            <SignOutButton>
              <button style={{ marginTop: "1rem" }}>Sign out</button>
            </SignOutButton>
          </div>
        )}

        {adminStatus === ADMIN_STATUS.error && (
          <div style={{ padding: "1.5rem", maxWidth: 520 }}>
            <h2>Unable to verify admin access</h2>
            <p>Please check your backend connection and try again.</p>
          </div>
        )}

        {adminStatus === ADMIN_STATUS.authorized && (
          <>
            <hr />
            <div className="app-content">
              <Sidebar />
              <Routes>
                <Route path="/add" element={<Add url={url} getToken={getToken} />} />
                <Route path="/list" element={<List url={url} getToken={getToken} />} />
                <Route path="/orders" element={<Orders url={url} getToken={getToken} />} />
                <Route
                  path="/add-restaurant"
                  element={<AddRestaurant url={url} getToken={getToken} />}
                />
                <Route
                  path="/manage-restaurants"
                  element={<ListRestaurants url={url} getToken={getToken} />}
                />
                <Route path="*" element={<Navigate to="/orders" replace />} />
              </Routes>
            </div>
          </>
        )}
      </SignedIn>
    </div>
  );
};

export default App;
