import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Store,
  ClipboardList,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Package,
  Star,
  Users,
  Layers,
  MapPin,
  RefreshCw,
} from "lucide-react";

const Dashboard = ({ url, getToken }) => {
  const [stats, setStats] = useState({ foods: 0, restaurants: 0, orders: 0, revenue: 0, users: 0 });
  const [recentFoods, setRecentFoods] = useState([]);
  const [recentRestaurants, setRecentRestaurants] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [cityDistribution, setCityDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [foodsRes, restaurantsRes, ordersRes, usersRes] = await Promise.allSettled([
        axios.get(`${url}/api/food/list`),
        axios.get(`${url}/api/admin/restaurants/list`, { headers }),
        axios.get(`${url}/api/order/list`, { headers }),
        axios.get(`${url}/api/user/list`, { headers }),
      ]);

      const foods = foodsRes.status === "fulfilled" && foodsRes.value.data.success
        ? foodsRes.value.data.data : [];
      const restaurants = restaurantsRes.status === "fulfilled" && restaurantsRes.value.data.success
        ? restaurantsRes.value.data.data : [];
      const orders = ordersRes.status === "fulfilled" && ordersRes.value.data.success
        ? ordersRes.value.data.data : [];
      const usersList = usersRes.status === "fulfilled" && usersRes.value.data.success
        ? usersRes.value.data.data : [];

      const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

      // Process food category distributions
      const categoryCounts = {};
      foods.forEach((f) => {
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
      });
      const totalFoods = foods.length || 1;
      const processedCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalFoods) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process restaurant city distributions
      const cityCounts = {};
      restaurants.forEach((r) => {
        cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
      });
      const totalRestaurants = restaurants.length || 1;
      const processedCities = Object.entries(cityCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalRestaurants) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        foods: foods.length,
        restaurants: restaurants.length,
        orders: orders.length,
        revenue,
        users: usersList.length,
      });

      setRecentFoods(foods.slice(0, 5));
      setRecentRestaurants(restaurants.slice(0, 5));
      setCategoryDistribution(processedCategories);
      setCityDistribution(processedCities);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [url, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh logic
  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        load(true); // silent refresh (doesn't trigger full screen loading spinner)
      }, 30000); // every 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, load]);

  const statCards = [
    { label: "Food Items", value: stats.foods, icon: UtensilsCrossed, color: "accent" },
    { label: "Restaurants", value: stats.restaurants, icon: Store, color: "success" },
    { label: "Total Orders", value: stats.orders, icon: ClipboardList, color: "info" },
    { label: "Total Revenue", value: `₹${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: "warning" },
    { label: "Registered Users", value: stats.users, icon: Users, color: "purple" },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Top Header Row with Auto Refresh Toggle */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: "4px 0 0" }}>Real-time analytics and statistics overview</p>
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
          <button className="btn btn-secondary btn-sm" onClick={() => load(false)} title="Force Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

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
        <Link to="/users" className="quick-action-btn">
          <div className="quick-action-icon"><Users size={18} /></div>
          Manage Users
        </Link>
      </div>

      {/* Metrics & Distributions */}
      <div className="two-col" style={{ marginBottom: 28 }}>
        {/* Category distribution */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">
              <Layers size={16} style={{ verticalAlign: "middle", marginRight: 8, color: "var(--accent-primary)" }} />
              Menu Breakdown by Category
            </span>
          </div>
          {categoryDistribution.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <Layers size={36} />
              <p>No categories analysis available</p>
            </div>
          ) : (
            <div className="distribution-list">
              {categoryDistribution.map((item) => (
                <div key={item.name} className="distribution-item">
                  <div className="dist-meta">
                    <span className="dist-name">{item.name}</span>
                    <span className="dist-val">{item.count} items ({item.percentage}%)</span>
                  </div>
                  <div className="dist-progress-track">
                    <div
                      className="dist-progress-bar accent-bar"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City distribution */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">
              <MapPin size={16} style={{ verticalAlign: "middle", marginRight: 8, color: "var(--info)" }} />
              Restaurant Coverage by City
            </span>
          </div>
          {cityDistribution.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <MapPin size={36} />
              <p>No coverage analysis available</p>
            </div>
          ) : (
            <div className="distribution-list">
              {cityDistribution.map((item) => (
                <div key={item.name} className="distribution-item">
                  <div className="dist-meta">
                    <span className="dist-name">{item.name}</span>
                    <span className="dist-val">{item.count} stores ({item.percentage}%)</span>
                  </div>
                  <div className="dist-progress-track">
                    <div
                      className="dist-progress-bar info-bar"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                <div className="recent-item-price">₹{item.price.toFixed(2)}</div>
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
                  {r.rating.toFixed(1)}
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
