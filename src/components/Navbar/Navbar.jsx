import React from "react";
import "./Navbar.css";
import { assets } from "@/assets/assets.js";

const Navbar = ({ onLogout }) => {
  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="Feasto Admin" />
      <div className="navbar-right">
        <img className="profile" src={assets.profile_image} alt="Profile" />
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
