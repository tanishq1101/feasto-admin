import React, { useState, useEffect } from "react";
import "./Users.css";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Shield,
  ShieldAlert,
  User,
  RefreshCw,
  Calendar,
  Mail,
  UserCheck,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const Users = ({ url, getToken }) => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const { user: currentUser } = useUser();

  const getAuthHeaders = async () => ({
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = String(text).split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={index} style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)', color: 'var(--accent-primary)', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> 
            : part
        )}
      </>
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/user/list`, await getAuthHeaders());
      if (res.data.success) {
        setUsers(res.data.data);
        setFiltered(res.data.data);
      } else {
        toast.error("Failed to load users list");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(
            (u) =>
              (u.name && u.name.toLowerCase().includes(q)) ||
              u.email.toLowerCase().includes(q) ||
              u.id.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  const toggleAdmin = async (userId, currentRole) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot modify your own administrative privileges.");
      return;
    }

    const actionText = currentRole
      ? "Revoke administrative privileges from this user?"
      : "Grant administrative privileges to this user?";
    if (!window.confirm(actionText)) return;

    setTogglingId(userId);
    try {
      const res = await axios.post(
        `${url}/api/user/toggle-admin`,
        { userId },
        await getAuthHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message || "User role updated");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isAdmin: !currentRole } : u
          )
        );
      } else {
        toast.error(res.data.message || "Failed to update role");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setTogglingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Monitor customer accounts and manage administrative access roles</p>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="users-search">
          <Search size={16} className="users-search-icon" />
          <input
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="users-toolbar-actions">
          <span className="users-count">
            Total Users: <strong>{users.length}</strong> (Admins:{" "}
            <strong>{users.filter((u) => u.isAdmin).length}</strong>)
          </span>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} title="Refresh">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="users-table-wrap">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Fetching users list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No Users Found</h3>
            <p>{search ? "No matches for your search query." : "No registered users in system database."}</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Access Level</th>
                <th>Joined</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={isSelf ? "self-row" : ""}>
                    <td>
                      <div className="user-avatar-wrap">
                        <div className={`user-avatar ${u.isAdmin ? "admin-avatar" : ""}`}>
                          {getInitials(u.name)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-name">
                        {u.name ? highlightMatch(u.name, search) : <span className="unnamed-label">Unnamed User</span>}
                        {isSelf && <span className="self-badge">You</span>}
                      </div>
                      <div className="user-db-id">{highlightMatch(u.id, search)}</div>
                    </td>
                    <td>
                      <div className="user-email-cell">
                        <Mail size={12} />
                        <span>{highlightMatch(u.email, search)}</span>
                      </div>
                    </td>
                    <td>
                      {u.isAdmin ? (
                        <span className="badge badge-success role-badge">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="badge badge-info role-badge">
                          <User size={12} />
                          User
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="user-joined-cell">
                        <Calendar size={12} />
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-actions">
                        {isSelf ? (
                          <span className="self-role-info">Current Account</span>
                        ) : (
                          <button
                            className={`action-btn ${
                              u.isAdmin ? "action-btn-delete" : "action-btn-edit"
                            }`}
                            onClick={() => toggleAdmin(u.id, u.isAdmin)}
                            disabled={togglingId === u.id}
                            style={{ margin: "0 auto" }}
                          >
                            {togglingId === u.id ? (
                              <RefreshCw size={12} className="spin" />
                            ) : u.isAdmin ? (
                              <>
                                <ShieldAlert size={13} />
                                Revoke Admin
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} />
                                Make Admin
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
