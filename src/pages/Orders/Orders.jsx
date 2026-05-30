import React, { useState, useEffect, useCallback } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Package,
  Trash2,
  RefreshCw,
  MapPin,
  Phone,
  ShoppingBag,
  DollarSign,
  ClipboardList,
  Search,
  X,
  CreditCard,
  Printer,
  Calendar,
  User,
  IndianRupee,
} from "lucide-react";

const STATUS_FILTERS = ["All", "Pending", "Order Placed", "Food Processing", "Out for Delivery", "Delivered"];

const Orders = ({ url, getToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getAuthHeaders = async () => ({ headers: { Authorization: `Bearer ${await getToken()}` } });

  const fetchAllOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await axios.get(`${url}/api/order/list`, await getAuthHeaders());
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        toast.error(res.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      if (!isSilent) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, getToken]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Auto-refresh logic
  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchAllOrders(true); // silent refresh
      }, 30000); // 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, fetchAllOrders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const res = await axios.post(
        `${url}/api/order/status`,
        { orderId, status },
        await getAuthHeaders()
      );
      if (res.data.success) {
        toast.success("Order status updated");
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status }));
        }
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      const res = await axios.delete(`${url}/api/order/admin/${orderId}`, await getAuthHeaders());
      if (res.data.success) {
        toast.success("Order deleted");
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        toast.error(res.data.message || "Failed to delete order");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "Order Placed") return "placed";
    if (status === "Food Processing") return "processing";
    if (status === "Out for Delivery") return "out-for-delivery";
    if (status === "Delivered") return "delivered";
    return "";
  };

  const getTabCount = (tab) => {
    if (tab === "All") return orders.length;
    return orders.filter((o) => o.status === tab).length;
  };

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

  // Filter & Search logic
  const filtered = orders.filter((order) => {
    if (activeFilter !== "All" && order.status !== activeFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    const name = `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.toLowerCase();
    const phone = (order.address?.phone || "").toLowerCase();
    const id = order.id.toLowerCase();
    const itemsText = order.items?.map((i) => i.name).join(" ").toLowerCase() || "";
    const street = (order.address?.street || "").toLowerCase();
    const city = (order.address?.city || "").toLowerCase();

    return (
      name.includes(q) ||
      phone.includes(q) ||
      id.includes(q) ||
      itemsText.includes(q) ||
      street.includes(q) ||
      city.includes(q)
    );
  });

  const printOrder = () => {
    window.print();
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage and track all customer orders in real-time</p>
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-search-wrapper">
          <Search size={16} className="orders-search-icon" />
          <input
            placeholder="Search by name, ID, phone, street, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <label className="auto-refresh-toggle" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-secondary)", cursor: "pointer", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--accent-primary)", cursor: "pointer" }}
            />
            <span>Auto Refresh (30s)</span>
          </label>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchAllOrders(false)}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab${activeFilter === f ? " active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f === "All" ? "All" : f} <span className="tab-count-pill">{getTabCount(f)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No Orders Found</h3>
          <p>{searchQuery ? "No matches for search terms." : "No orders match the selected filter."}</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
              {/* Icon */}
              <div className="order-parcel-icon">
                <Package size={18} />
              </div>

              {/* Details */}
              <div className="order-body">
                <div className="order-header-row">
                  <span className="order-id-label">ID: {highlightMatch(order.id.slice(-6).toUpperCase(), searchQuery)}</span>
                  <span className="order-date-label">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="order-items-text">
                  {order.items?.map((item, index) => (
                    <span key={index}>
                      {highlightMatch(item.name, searchQuery)} ×{item.quantity}
                      {index < order.items.length - 1 ? ", " : ""}
                    </span>
                  )) || "No items"}
                </div>

                {order.address && (
                  <>
                    <div className="order-customer-name">
                      {highlightMatch(`${order.address.firstName || ""} ${order.address.lastName || ""}`, searchQuery)}
                    </div>
                    <div className="order-address">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <MapPin size={12} style={{ marginTop: 2, flexShrink: 0, color: "var(--text-muted)" }} />
                        <span>
                          {order.address.street && <>{highlightMatch(order.address.street, searchQuery)}, </>}
                          {order.address.city && <>{highlightMatch(order.address.city, searchQuery)}</>}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="order-meta">
                  {order.address?.phone && (
                    <span className="order-meta-chip">
                      <Phone size={11} />
                      {highlightMatch(order.address.phone, searchQuery)}
                    </span>
                  )}
                  <span className="order-meta-chip">
                    <ShoppingBag size={11} />
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                  </span>
                  <span className="order-meta-chip" style={{ color: "var(--text-primary)" }}>
                    <IndianRupee size={11} style={{ display: "inline-block", verticalAlign: "middle" }} />
                    <strong style={{ color: "var(--accent-primary)" }}>
                      {order.amount?.toFixed(2) || "0.00"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Right panel */}
              <div className="order-right" onClick={(e) => e.stopPropagation()}>
                <select
                  className={`order-status-select ${getStatusClass(order.status)}`}
                  value={order.status || "Food Processing"}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="Pending">⌛ Pending</option>
                  <option value="Order Placed">📦 Order Placed</option>
                  <option value="Food Processing">🍳 Processing</option>
                  <option value="Out for Delivery">🚗 Out for Delivery</option>
                  <option value="Delivered">✅ Delivered</option>
                </select>

                <button
                  className="order-delete-btn"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Inspection Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Order Details</h3>
                <span className="order-modal-sub">ID: {selectedOrder.id}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="order-modal-content">
              {/* Top Meta info */}
              <div className="order-modal-meta-grid">
                <div className="meta-card-block">
                  <div className="meta-card-title">
                    <User size={13} /> Customer Details
                  </div>
                  <div className="meta-card-value">
                    {selectedOrder.address?.firstName || ""} {selectedOrder.address?.lastName || ""}
                  </div>
                  {selectedOrder.address?.phone && (
                    <div className="meta-card-sub" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <Phone size={11} /> {selectedOrder.address.phone}
                    </div>
                  )}
                </div>

                <div className="meta-card-block">
                  <div className="meta-card-title">
                    <Calendar size={13} /> Date Placed
                  </div>
                  <div className="meta-card-value">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="meta-card-sub">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="meta-card-block">
                  <div className="meta-card-title">
                    <CreditCard size={13} /> Payment Info
                  </div>
                  <div className="meta-card-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={`badge ${selectedOrder.payment ? "badge-success" : "badge-warning"}`}>
                      {selectedOrder.payment ? "PAID" : "UNPAID"}
                    </span>
                  </div>
                  <div className="meta-card-sub" style={{ marginTop: 4 }}>
                    {selectedOrder.stripeSessionId ? "Stripe Credit Card" : "Cash on Delivery"}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="modal-section-title">Delivery Address</div>
              <div className="modal-address-block">
                <MapPin size={16} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div className="address-street">{selectedOrder.address?.street}</div>
                  <div className="address-city-state">
                    {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}
                  </div>
                  <div className="address-country">{selectedOrder.address?.country}</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="modal-section-title">Items Ordered</div>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="order-table-item-name">{item.name}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>₹{item.price?.toFixed(2)}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{(item.price * item.quantity)?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="3" style={{ textAlign: "right", fontWeight: 600 }}>Grand Total:</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--accent-primary)" }}>
                      ₹{selectedOrder.amount?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Status Changer inside modal */}
              <div className="modal-section-title">Update Order Status</div>
              <div className="modal-status-changer">
                <select
                  className={`order-status-select ${getStatusClass(selectedOrder.status)}`}
                  value={selectedOrder.status || "Food Processing"}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  style={{ width: "100%", padding: 12, height: "auto" }}
                >
                  <option value="Pending">⌛ Pending</option>
                  <option value="Order Placed">📦 Order Placed</option>
                  <option value="Food Processing">🍳 Processing</option>
                  <option value="Out for Delivery">🚗 Out for Delivery</option>
                  <option value="Delivered">✅ Delivered</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={printOrder}>
                <Printer size={14} /> Print Receipt
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
