import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Store,
  ClipboardList,
  TrendingUp,
  PlusCircle,
  PlusSquare,
  ArrowRight,
  Package,
  Star,
} from "lucide-react";

const Dashboard = ({ url, getToken }) => {
  const [stats, setStats] = useState({ foods: 0, restaurants: 0, orders: 0, revenue: 0 });
  const [recentFoods, setRecentFoods] = useState([]);
  const [recentRestaurants, setRecentRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [foodsRes, restaurantsRes, ordersRes] = await Promise.allSettled([
          axios.get(`${url}/api/food/list`),
          axios.get(`${url}/api/admin/restaurants/list`, { headers }),
          axios.get(`${url}/api/order/list`, { headers }),
        ]);

        const foods = foodsRes.status === "fulfilled" && foodsRes.value.data.success
          ? foodsRes.value.data.data : [];
        const restaurants = restaurantsRes.status === "fulfilled" && restaurantsRes.value.data.success
          ? restaurantsRes.value.data.data : [];
        const orders = ordersRes.status === "fulfilled" && ordersRes.value.data.success
          ? ordersRes.value.data.data : [];

        const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

        setStats({
          foods: foods.length,
          restaurants: restaurants.length,
          orders: orders.length,
          revenue,
        });
        setRecentFoods(foods.slice(0, 5));
        setRecentRestaurants(restaurants.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [url, getToken]);

  const statCards = [
    { label: "Food Items", value: stats.foods, icon: UtensilsCrossed, color: "accent" },
    { label: "Restaurants", value: stats.restaurants, icon: Store, color: "success" },
    { label: "Total Orders", value: stats.orders, icon: ClipboardList, color: "info" },
    { label: "Revenue", value: `$${stats.revenue.toFixed(0)}`, icon: TrendingUp, color: "warning" },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="dashboard-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className={`stat-icon ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Quick Actions</h2>
      </div>
      <div className="quick-actions" style={{ marginBottom: 32 }}>
        <Link to="/add" className="quick-action-btn">
          <div className="quick-action-icon"><PlusCircle size={18} /></div>
          Add Food Item
        </Link>
        <Link to="/add-restaurant" className="quick-action-btn">
          <div className="quick-action-icon"><Store size={18} /></div>
          Add Restaurant
        </Link>
        <Link to="/orders" className="quick-action-btn">
          <div className="quick-action-icon"><ClipboardList size={18} /></div>
          View Orders
        </Link>
        <Link to="/list" className="quick-action-btn">
          <div className="quick-action-icon"><UtensilsCrossed size={18} /></div>
          Manage Foods
        </Link>
      </div>

      {/* Recent Data */}
      <div className="two-col">
        {/* Recent Foods */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Food Items</span>
            <Link to="/list" className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {recentFoods.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <Package size={36} />
              <p>No food items yet</p>
            </div>
          ) : (
            recentFoods.map((item) => (
              <div key={item.id} className="recent-item">
                {item.image ? (
                  <img
                    src={item.image.startsWith("http") ? item.image : `${url}/images/${item.image}`}
                    alt={item.name}
                    className="recent-item-img"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="recent-item-img-placeholder">
                    <UtensilsCrossed size={18} />
                  </div>
                )}
                <div className="recent-item-info">
                  <div className="recent-item-name">{item.name}</div>
                  <div className="recent-item-meta">{item.category}</div>
                </div>
                <div className="recent-item-price">${item.price}</div>
              </div>
            ))
          )}
        </div>

        {/* Recent Restaurants */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Restaurants</span>
            <Link to="/manage-restaurants" className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {recentRestaurants.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <Store size={36} />
              <p>No restaurants yet</p>
            </div>
          ) : (
            recentRestaurants.map((r) => (
              <div key={r.id} className="recent-item">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="recent-item-img"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="recent-item-img-placeholder">
                    <Store size={18} />
                  </div>
                )}
                <div className="recent-item-info">
                  <div className="recent-item-name">{r.name}</div>
                  <div className="recent-item-meta">{r.city} · {r.cuisine}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--warning)", fontSize: 13, fontWeight: 700 }}>
                  <Star size={13} fill="currentColor" />
                  {r.rating}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
