import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Edit2,
  Trash2,
  UtensilsCrossed,
  X,
  Save,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  "Salad", "Rolls", "Deserts", "Sandwich", "Cake",
  "Pure Veg", "Pasta", "Noodles", "Biryani", "Pizza",
  "Burger", "Soup", "Drinks", "Snacks", "Seafood",
];

const List = ({ url, getToken }) => {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const [editItem, setEditItem] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: "", category: "", price: "", image: "", description: "" });
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = async () => ({ headers: { Authorization: `Bearer ${await getToken()}` } });

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

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success) {
        setList(res.data.data);
        setFiltered(res.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (err) {
      toast.error("Error fetching food list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & Sort logic
  useEffect(() => {
    let result = [...list];

    // Filter search query
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    // Filter active category
    if (activeCategory !== "All") {
      result = result.filter((i) => i.category === activeCategory);
    }

    // Sort active selection
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFiltered(result);
  }, [search, activeCategory, sortBy, list]);

  const removeFood = async (id) => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      const res = await axios.post(`${url}/api/food/remove`, { id }, await getAuthHeaders());
      if (res.data.success) {
        toast.success("Item deleted successfully");
        fetchList();
      } else {
        toast.error("Error deleting item");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting item");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item.id);
    setUpdatedData({
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image || "",
      description: item.description || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(
        `${url}/api/food/update`,
        { id: editItem, ...updatedData, price: Number(updatedData.price) },
        await getAuthHeaders()
      );
      if (res.data.success) {
        toast.success("Item updated successfully!");
        setEditItem(null);
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating item");
    } finally {
      setSaving(false);
    }
  };

  const imgSrc = (item) =>
    item.image && item.image.startsWith("http")
      ? item.image
      : item.image
      ? `${url}/images/${item.image}`
      : null;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Food Items</h1>
        <p>Manage all food items shown on the Feasto storefront</p>
      </div>

      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="list-search">
          <Search size={16} className="list-search-icon" />
          <input
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="list-toolbar-right">
          {/* Sorting Dropdown */}
          <div className="list-sort-select-wrapper">
            <SlidersHorizontal size={14} className="sort-icon-overlay" />
            <select
              className="list-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default Order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="list-count">{filtered.length} items</span>
            <button className="btn btn-secondary btn-sm" onClick={fetchList} title="Refresh">
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-pills-wrap">
        <button
          className={`category-pill${activeCategory === "All" ? " active" : ""}`}
          onClick={() => setActiveCategory("All")}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill${activeCategory === cat ? " active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="food-table-wrap">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading food items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed size={48} />
            <h3>No Food Items Found</h3>
            <p>
              {search || activeCategory !== "All"
                ? "Try adjusting search query or active category filters."
                : "Add your first food item to get started."}
            </p>
          </div>
        ) : (
          <table className="food-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    {imgSrc(item) ? (
                      <img src={imgSrc(item)} alt={item.name} className="food-img"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="food-img-placeholder">
                        <UtensilsCrossed size={20} />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="food-name">{highlightMatch(item.name, search)}</div>
                    {item.description && (
                      <div className="food-description">{highlightMatch(item.description, search)}</div>
                    )}
                  </td>
                  <td>
                    <span className="food-category-pill">{highlightMatch(item.category, search)}</span>
                  </td>
                  <td>
                    <span className="food-price">₹{item.price.toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="food-actions">
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(item)}>
                        <Edit2 size={13} />
                        Edit
                      </button>
                      <button className="action-btn action-btn-delete" onClick={() => removeFood(item.id)}>
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
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Food Item</h3>
              <button className="modal-close" onClick={() => setEditItem(null)}>
                <X size={16} />
              </button>
            </div>

            <form className="edit-modal-form" onSubmit={handleUpdate}>
              {updatedData.image && (
                <img
                  src={updatedData.image.startsWith("http") ? updatedData.image : `${url}/images/${updatedData.image}`}
                  alt="preview"
                  className="edit-modal-preview"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}

              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" type="text" placeholder="Food name" value={updatedData.name}
                  onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Description" value={updatedData.description}
                  onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })} />
              </div>

              <div className="edit-modal-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={updatedData.category}
                    onChange={(e) => setUpdatedData({ ...updatedData, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" min="0.01" step="0.01" placeholder="Price"
                    value={updatedData.price}
                    onChange={(e) => setUpdatedData({ ...updatedData, price: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" type="text" placeholder="https://..." value={updatedData.image}
                  onChange={(e) => setUpdatedData({ ...updatedData, image: e.target.value })} />
              </div>

              <div className="modal-footer" style={{ paddingTop: 0, borderTop: "none", marginTop: 4 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>
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

export default List;
