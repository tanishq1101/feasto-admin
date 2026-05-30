import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./listRestaurant.css";
import {
  Search,
  Edit2,
  Trash2,
  Store,
  Star,
  X,
  Save,
  RefreshCw,
  MapPin,
} from "lucide-react";

const ListRestaurants = ({ url, getToken }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", city: "", cuisine: "", rating: "", image: "", address: "" });
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = async () => ({ headers: { Authorization: `Bearer ${await getToken()}` } });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/admin/restaurants/list`, await getAuthHeaders());
      if (res.data.success) {
        setRestaurants(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? restaurants.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q)
      ) : restaurants
    );
  }, [search, restaurants]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant?")) return;
    try {
      await axios.delete(`${url}/api/admin/restaurants/delete/${id}`, await getAuthHeaders());
      toast.success("Restaurant deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleEditClick = (r) => {
    setEditId(r.id);
    setEditData({ name: r.name, city: r.city, cuisine: r.cuisine, rating: r.rating, image: r.image || "", address: r.address || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${url}/api/admin/restaurants/update/${editId}`,
        editData,
        await getAuthHeaders()
      );
      toast.success("Restaurant updated!");
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="list-restaurants-page">
      <div className="page-header">
        <h1>Manage Restaurants</h1>
        <p>Edit, delete, and manage all restaurants on Feasto</p>
      </div>

      {/* Toolbar */}
      <div className="restaurant-toolbar">
        <div className="restaurant-search">
          <Search size={16} className="restaurant-search-icon" />
          <input
            placeholder="Search by name, city, or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{filtered.length} restaurants</span>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="restaurant-table-wrap">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading restaurants...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Store size={48} />
            <h3>No Restaurants Found</h3>
            <p>{search ? "Try a different search term" : "Add your first restaurant to get started"}</p>
          </div>
        ) : (
          <table className="restaurant-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Restaurant</th>
                <th>City</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="rest-img"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="rest-img-placeholder">
                        <Store size={20} />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="rest-name">{r.name}</div>
                    {r.address && (
                      <div className="rest-address">
                        <MapPin size={10} style={{ display: "inline", marginRight: 3 }} />
                        {r.address}
                      </div>
                    )}
                  </td>
                  <td>{r.city}</td>
                  <td>
                    <span className="rest-cuisine-pill">{r.cuisine}</span>
                  </td>
                  <td>
                    <div className="rest-rating">
                      <Star size={13} fill="currentColor" />
                      {r.rating}
                    </div>
                  </td>
                  <td>
                    <div className="rest-actions">
                      <button className="action-btn action-btn-edit" onClick={() => handleEditClick(r)}>
                        <Edit2 size={13} />
                        Edit
                      </button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="modal-overlay" onClick={() => setEditId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Restaurant</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>
                <X size={16} />
              </button>
            </div>

            <form className="rest-edit-form" onSubmit={handleUpdate}>
              {editData.image && (
                <img src={editData.image} alt="preview"
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }}
                  onError={(e) => { e.target.style.display = "none"; }} />
              )}

              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input className="form-input" type="text" value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })} required />
              </div>

              <div className="rest-edit-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" type="text" value={editData.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Cuisine</label>
                  <input className="form-input" type="text" value={editData.cuisine}
                    onChange={(e) => setEditData({ ...editData, cuisine: e.target.value })} required />
                </div>
              </div>

              <div className="rest-edit-row">
                <div className="form-group">
                  <label className="form-label">Rating (1–5)</label>
                  <input className="form-input" type="number" step="0.1" min="1" max="5" value={editData.rating}
                    onChange={(e) => setEditData({ ...editData, rating: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" type="text" value={editData.image}
                    onChange={(e) => setEditData({ ...editData, image: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" type="text" value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
              </div>

              <div className="modal-footer" style={{ paddingTop: 0, borderTop: "none", marginTop: 4 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditId(null)}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRestaurants;
