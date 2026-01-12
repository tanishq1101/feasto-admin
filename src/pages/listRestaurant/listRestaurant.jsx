import React, { useEffect, useState } from "react";
import axios from "axios";
import "./listRestaurant.css";

const ListRestaurants = ({ url }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    city: "",
    cuisine: "",
    rating: "",
    image: "",
  });

  const load = async () => {
    try {
      const res = await axios.get(`${url}/api/admin/restaurants/list`);
      if (res.data.success) setRestaurants(res.data.data);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant?")) return;
    await axios.delete(`${url}/api/admin/restaurants/delete/${id}`);
    load();
  };

  const handleEditClick = (restaurant) => {
    setEditRestaurant(restaurant._id);
    setUpdatedData({
      name: restaurant.name,
      city: restaurant.city,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      image: restaurant.image,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`${url}/api/admin/restaurants/update/${editRestaurant}`, updatedData);
    setEditRestaurant(null);
    load();
  };

  return (
    <div className="list-restaurants">
      <h2>Restaurants</h2>

      <table className="restaurant-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>City</th>
            <th>Cuisine</th>
            <th>Rating</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {restaurants.map((r) => (
            <tr key={r._id}>
              <td><img src={r.image} alt={r.name} className="table-img" /></td>
              <td>{r.name}</td>
              <td>{r.city}</td>
              <td>{r.cuisine}</td>
              <td>{r.rating}</td>
              <td className="actions">
                <button className="edit" onClick={() => handleEditClick(r)}>Edit</button>
                <button className="delete" onClick={() => handleDelete(r._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Edit Popup */}
      {editRestaurant && (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <h3>Edit Restaurant</h3>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                placeholder="Name"
                value={updatedData.name}
                onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={updatedData.city}
                onChange={(e) => setUpdatedData({ ...updatedData, city: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Cuisine"
                value={updatedData.cuisine}
                onChange={(e) => setUpdatedData({ ...updatedData, cuisine: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={updatedData.rating}
                onChange={(e) => setUpdatedData({ ...updatedData, rating: e.target.value })}
                required
              />

              {/* ✅ NEW FIELD: Image URL */}
              <input
                type="text"
                placeholder="Image URL"
                value={updatedData.image}
                onChange={(e) => setUpdatedData({ ...updatedData, image: e.target.value })}
              />

              <div className="edit-buttons">
                <button type="submit">Save</button>
                <button type="button" className="cancel" onClick={() => setEditRestaurant(null)}>
                  Cancel
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

