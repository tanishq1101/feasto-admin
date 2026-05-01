import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./addRestaurant.css";

const AddRestaurant = ({ url, getToken }) => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    cuisine: "",
    rating: "",
    image: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${url}/api/admin/restaurants/add`,
        form,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (response.data.success) {
        toast.success("Restaurant Added Successfully");
        setForm({
          name: "",
          city: "",
          address: "",
          cuisine: "",
          rating: "",
          image: "",
        });
      } else {
        toast.error("Failed to add restaurant");
      }
    } catch (error) {
      console.error("Add Restaurant Error:", error);
      toast.error(error.response?.data?.message || "Server Error");
    }
  };

  return (
    <div className="add-restaurant">
      <h2>Add New Restaurant 🏬</h2>

      <form className="restaurant-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Restaurant Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Cuisine (e.g., North Indian, South Indian)</label>
          <input name="cuisine" value={form.cuisine} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Rating</label>
          <input name="rating" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Image URL</label>
          <input
            name="image"
            value={form.image}
            placeholder="https://example.com/restaurant.jpg"
            onChange={handleChange}
            required
          />
        </div>

        <button className="submit-btn" type="submit">
          Add Restaurant
        </button>
      </form>
    </div>
  );
};

export default AddRestaurant;
