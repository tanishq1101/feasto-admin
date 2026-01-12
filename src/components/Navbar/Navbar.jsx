import React from "react";
import "./Navbar.css";
// ✅ Corrected import path and added .js extension
import { assets } from "@/assets/assets.js";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const navigate = useNavigate();
  <button onClick={() => navigate("/myorders")}>Orders</button>

  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="" />
      <img className="profile" src={assets.profile_image} alt="" />
    </div>
  );
};

export default Navbar;
