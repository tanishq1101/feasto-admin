import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url, getToken }) => {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
  });

  const getAuthHeaders = async () => ({ headers: { Authorization: `Bearer ${await getToken()}` } });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) setList(response.data.data);
      else toast.error("Error fetching list");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching list");
    }
  };

  const removeFood = async (foodId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        await getAuthHeaders()
      );
      await fetchList();
      if (response.data.success) toast.success(response.data.message);
      else toast.error("Error removing item");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing item");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item.id);
    setUpdatedData({
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${url}/api/food/update`,
        {
          id: editItem,
          name: updatedData.name,
          category: updatedData.category,
          price: updatedData.price,
          image: updatedData.image || undefined,
        },
        await getAuthHeaders()
      );

      if (response.data.success) {
        toast.success("Item updated successfully!");
        setEditItem(null);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating item");
    }
  };

  useEffect(() => {
    fetchList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Actions</b>
        </div>
        {list.map((item) => (
          <div key={item.id} className="list-table-format">
            <img
              src={
                item.image && item.image.startsWith("http")
                  ? item.image
                  : `${url}/images/${item.image}`
              }
              alt={item.name}
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>${item.price}</p>
            <div className="list-actions">
              <button className="edit-btn" onClick={() => handleEdit(item)}>
                ✏️ Edit
              </button>
              <button
                className="list-remove-btn"
                onClick={() => removeFood(item.id)}
                title="Remove item"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Popup */}
      {editItem && (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <h3>Edit Food Item</h3>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                placeholder="Name"
                value={updatedData.name}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={updatedData.category}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, category: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={updatedData.price}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, price: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={updatedData.image}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, image: e.target.value })
                }
              />
              <div className="edit-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditItem(null)}>
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

export default List;
