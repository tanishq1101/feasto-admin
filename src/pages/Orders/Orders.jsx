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
} from "lucide-react";

const STATUS_FILTERS = ["All", "Food Processing", "Out for Delivery", "Delivered"];

const Orders = ({ url, getToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const getAuthHeaders = async () => ({ headers: { Authorization: `Bearer ${await getToken()}` } });

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/order/list`, await getAuthHeaders());
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        toast.error(res.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, getToken]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

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
      } else {
        toast.error(res.data.message || "Failed to delete order");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const getStatusClass = (status) => {
    if (status === "Food Processing") return "processing";
    if (status === "Out for Delivery") return "out-for-delivery";
    if (status === "Delivered") return "delivered";
    return "";
  };

  const filtered = activeFilter === "All"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage and track all customer orders in real-time</p>
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-filter-tabs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f} {f === "All" && `(${orders.length})`}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAllOrders}>
          <RefreshCw size={14} /> Refresh
        </button>
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
          <p>{activeFilter !== "All" ? `No orders with status "${activeFilter}"` : "No orders have been placed yet"}</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div key={order.id} className="order-card">
              {/* Icon */}
              <div className="order-parcel-icon">
                <Package size={18} />
              </div>

              {/* Details */}
              <div className="order-body">
                <div className="order-items-text">
                  {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(", ") || "No items"}
                </div>

                {order.address && (
                  <>
                    <div className="order-customer-name">
                      {order.address.firstName || ""} {order.address.lastName || ""}
                    </div>
                    <div className="order-address">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <MapPin size={12} style={{ marginTop: 2, flexShrink: 0, color: "var(--text-muted)" }} />
                        <span>
                          {order.address.street && `${order.address.street}, `}
                          {order.address.city && `${order.address.city}, `}
                          {order.address.state && `${order.address.state}, `}
                          {order.address.country}
                          {order.address.zipcode && ` ${order.address.zipcode}`}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="order-meta">
                  {order.address?.phone && (
                    <span className="order-meta-chip">
                      <Phone size={11} />
                      {order.address.phone}
                    </span>
                  )}
                  <span className="order-meta-chip">
                    <ShoppingBag size={11} />
                    {order.items?.length || 0} items
                  </span>
                  <span className="order-meta-chip">
                    <DollarSign size={11} />
                    <strong style={{ color: "var(--accent-primary)" }}>
                      ${order.amount?.toFixed(2) || "0.00"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Right panel */}
              <div className="order-right">
                <select
                  className={`order-status-select ${getStatusClass(order.status)}`}
                  value={order.status || "Food Processing"}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
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
    </div>
  );
};

export default Orders;
