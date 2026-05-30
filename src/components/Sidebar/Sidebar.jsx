import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  UtensilsCrossed,
  ClipboardList,
  Store,
  PlusSquare,
  ChefHat,
  Users,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import "./Sidebar.css";

const navItems = [
  {
    section: "Overview",
    links: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/users", icon: Users, label: "Users" },
    ],
  },
  {
    section: "Food Management",
    links: [
      { to: "/add", icon: PlusCircle, label: "Add Food Item" },
      { to: "/list", icon: UtensilsCrossed, label: "Food Items" },
      { to: "/orders", icon: ClipboardList, label: "Orders" },
    ],
  },
  {
    section: "Restaurants",
    links: [
      { to: "/add-restaurant", icon: Store, label: "Add Restaurant" },
      { to: "/manage-restaurants", icon: PlusSquare, label: "Manage Restaurants" },
    ],
  },
];

const Sidebar = () => {
  const { user } = useUser();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ChefHat size={20} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span>Feasto</span>
          <span>Admin Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                <Icon className="link-icon" size={18} />
                <span className="link-text">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <SignOutButton>
          <div className="sidebar-footer-user">
            <div className="sidebar-footer-avatar">{initials}</div>
            <div className="sidebar-footer-info">
              <div className="sidebar-footer-name">{user?.fullName || "Admin"}</div>
              <div className="sidebar-footer-role">Super Admin</div>
            </div>
          </div>
        </SignOutButton>
      </div>
    </div>
  );
};

export default Sidebar;
