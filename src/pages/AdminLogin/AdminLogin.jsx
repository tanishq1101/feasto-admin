import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "./AdminLogin.css";

const AdminLogin = () => {
  return (
    <div className="admin-login">
      <div className="admin-login-header">
        <div className="admin-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">Feasto Admin</span>
        </div>
        <p className="admin-subtitle">Sign in with your admin account to continue</p>
      </div>

      <div className="admin-clerk-wrapper">
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "admin-clerk-root",
              card: "admin-clerk-card",
            },
            variables: {
              colorPrimary: "#e94560",
              colorBackground: "rgba(255,255,255,0.03)",
              colorText: "#ffffff",
              colorTextSecondary: "rgba(255,255,255,0.6)",
              colorInputBackground: "rgba(255,255,255,0.08)",
              colorInputText: "#ffffff",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
            },
          }}
          afterSignInUrl="/"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
