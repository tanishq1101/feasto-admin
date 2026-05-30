import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ShieldCheck, Sun, Moon } from "lucide-react";

const routeLabels = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/add": "Add Food Item",
  "/list": "Food Items",
  "/orders": "Orders",
  "/add-restaurant": "Add Restaurant",
  "/manage-restaurants": "Manage Restaurants",
};

const Navbar = () => {
  const location = useLocation();
  const label = routeLabels[location.pathname] || "Admin Panel";

  const [theme, setTheme] = useState(localStorage.getItem("admin-theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="admin-navbar">
      <div className="navbar-breadcrumb">
        <span>Admin</span>
        <span>/</span>
        <strong>{label}</strong>
      </div>

      <div className="navbar-right">
        <button 
          className="btn-icon theme-toggle-btn" 
          onClick={toggleTheme} 
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="navbar-badge">
          <ShieldCheck size={14} />
          <span>Admin</span>
        </div>

        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>

        <SignedIn>
          <div className="navbar-clerk-user">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
