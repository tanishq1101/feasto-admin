import React, { useState, useEffect, useCallback } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all orders
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // ✅ Update order status
  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status,
      });

      if (response.data.success) {
        toast.success("Order status updated");
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // ✅ Delete an order (no auth header, no token)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      // 👇 this ensures no default token or Authorization header interferes
      const response = await axios.delete(`${url}/api/order/admin/${orderId}`, {
        headers: {}, // clear headers so it doesn’t send token
      });

      if (response.data.success) {
        toast.success("Order deleted successfully");
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      } else {
        toast.error(response.data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Failed to delete order");
    }
  };

  if (loading) return <div className="order add">Loading orders...</div>;
  if (!orders.length) return <div className="order add">No orders found.</div>;

  return (
    <div className="order add">
      <h3>Orders</h3>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="parcel" />

            <div className="order-item-details">
              <p className="order-item-food">
                {order.items
                  ?.map((item) => `${item.name} x${item.quantity}`)
                  .join(", ") || "No items"}
              </p>

              <div className="order-item-name">
                {order.address
                  ? `${order.address.firstName || ""} ${
                      order.address.lastName || ""
                    }`
                  : "No name"}
              </div>

              {order.address && (
                <div className="order-item-address">
                  <p>{order.address.street || "No street"},</p>
                  <p>
                    {order.address.city || "No city"},{" "}
                    {order.address.state || "No state"},{" "}
                    {order.address.country || "No country"},{" "}
                    {order.address.zipcode || "No zipcode"}
                  </p>
                  <p>Phone: {order.address.phone || "No phone"}</p>
                </div>
              )}

              <p>Items count: {order.items?.length || 0}</p>
              <p>Total: ${order.amount?.toFixed(2) || 0}</p>

              <select
                value={order.status || "Food Processing"}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              {/* 🗑️ Delete Button */}
              <button
                className="remove-btn"
                onClick={() => handleDeleteOrder(order._id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
