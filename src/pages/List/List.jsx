import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    category: "",
    price: "",
    image: null,
  });

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if (response.data.success) setList(response.data.data);
    else toast.error("Error fetching list");
  };

  const removeFood = async (foodId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
    await fetchList();
    if (response.data.success) toast.success(response.data.message);
    else toast.error("Error removing item");
  };

  const handleEdit = (item) => {
    setEditItem(item._id);
    setUpdatedData({
      name: item.name,
      category: item.category,
      price: item.price,
      image: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", editItem);
      formData.append("name", updatedData.name);
      formData.append("category", updatedData.category);
      formData.append("price", updatedData.price);
      if (updatedData.image) formData.append("image", updatedData.image);

      const response = await axios.post(`${url}/api/food/update`, formData);

      if (response.data.success) {
        toast.success("Item updated successfully!");
        setEditItem(null);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating item");
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
          <div key={item._id} className="list-table-format">
            <img
          src={
                item.image.startsWith("http")
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
                onClick={() => removeFood(item._id)}
                title="Remove item"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Edit Popup */}
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
                type="file"
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, image: e.target.files[0] })
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
