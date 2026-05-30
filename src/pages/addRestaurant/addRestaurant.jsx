import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./addRestaurant.css";
import { Store, MapPin, UtensilsCrossed, Star, Image, Building2 } from "lucide-react";

const AddRestaurant = ({ url, getToken }) => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    cuisine: "",
    rating: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${url}/api/admin/restaurants/add`,
        form,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (res.data.success) {
        toast.success("✅ Restaurant added successfully!");
        setForm({ name: "", city: "", address: "", cuisine: "", rating: "", image: "" });
      } else {
        toast.error("Failed to add restaurant");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  const ratingNum = parseFloat(form.rating);
  const ratingDisplay = ratingNum >= 1 && ratingNum <= 5
    ? "★".repeat(Math.round(ratingNum)) + "☆".repeat(5 - Math.round(ratingNum))
    : "";

  return (
    <div className="add-restaurant-page">
      <div className="page-header">
        <h1>Add Restaurant</h1>
        <p>Add a new restaurant that will appear on the Feasto storefront</p>
      </div>

      <div className="restaurant-form-card">
        <h2>
          <Store size={20} color="var(--accent-primary)" />
          New Restaurant
        </h2>

        <form className="restaurant-form" onSubmit={handleSubmit}>
          {/* Image URL + preview */}
          <div className="form-group">
            <label className="form-label">
              <Image size={13} style={{ display: "inline", marginRight: 5 }} />
              Restaurant Image URL
            </label>
            <input
              className="form-input"
              name="image"
              value={form.image}
              placeholder="https://example.com/restaurant.jpg"
              onChange={handleChange}
              required
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="restaurant-img-preview"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              <Building2 size={13} style={{ display: "inline", marginRight: 5 }} />
              Restaurant Name
            </label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              placeholder="e.g. The Grand Biryani House"
              onChange={handleChange}
              required
            />
          </div>

          {/* City & Cuisine */}
          <div className="restaurant-form-row">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: "inline", marginRight: 5 }} />
                City
              </label>
              <input
                className="form-input"
                name="city"
                value={form.city}
                placeholder="e.g. Mumbai"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <UtensilsCrossed size={13} style={{ display: "inline", marginRight: 5 }} />
                Cuisine Type
              </label>
              <input
                className="form-input"
                name="cuisine"
                value={form.cuisine}
                placeholder="e.g. North Indian, Chinese"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={13} style={{ display: "inline", marginRight: 5 }} />
              Full Address
            </label>
            <input
              className="form-input"
              name="address"
              value={form.address}
              placeholder="e.g. 42, Marine Drive, Nariman Point"
              onChange={handleChange}
              required
            />
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">
              <Star size={13} style={{ display: "inline", marginRight: 5 }} />
              Rating (1–5)
            </label>
            <div className="rating-input-wrap">
              <input
                className="form-input"
                name="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                placeholder="e.g. 4.5"
                onChange={handleChange}
                required
              />
              {ratingDisplay && (
                <span className="rating-stars">{ratingDisplay}</span>
              )}
            </div>
          </div>

          <button className="restaurant-submit-btn" type="submit" disabled={loading}>
            <Store size={18} />
            {loading ? "Adding Restaurant..." : "Add Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;
