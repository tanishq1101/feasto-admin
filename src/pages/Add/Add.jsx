import React, { useState } from "react";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle, Image, Tag, DollarSign, AlignLeft, Layers } from "lucide-react";

const CATEGORIES = [
  "Salad", "Rolls", "Deserts", "Sandwich", "Cake",
  "Pure Veg", "Pasta", "Noodles", "Biryani", "Pizza",
  "Burger", "Soup", "Drinks", "Snacks", "Seafood",
];

const Add = ({ url, getToken }) => {
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!data.image) {
      toast.error("Please provide an image URL");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${url}/api/food/add`,
        {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          category: data.category,
          image: data.image,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (res.data.success) {
        toast.success("✅ Food item added successfully!");
        setData({ name: "", description: "", price: "", category: "Salad", image: "" });
      } else {
        toast.error(res.data.message || "Failed to add item");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-page">
      <div className="page-header">
        <h1>Add Food Item</h1>
        <p>Add a new dish to the menu that will appear on the frontend</p>
      </div>

      <div className="add-form-card">
        <h2>
          <PlusCircle size={20} color="var(--accent-primary)" />
          New Food Item
        </h2>

        <form className="add-form" onSubmit={onSubmit}>
          {/* Image URL */}
          <div className="form-group">
            <label className="form-label">
              <Image size={13} style={{ display: "inline", marginRight: 5 }} />
              Image URL
            </label>
            <input
              className="form-input"
              type="text"
              name="image"
              placeholder="https://example.com/food-image.jpg"
              value={data.image}
              onChange={onChange}
              required
            />
            {/* Preview */}
            <div className="image-preview-box">
              {data.image ? (
                <img
                  src={data.image}
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className="image-preview-placeholder"
                style={{ display: data.image ? "none" : "flex" }}>
                <Image size={32} />
                <span>Image preview will appear here</span>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={13} style={{ display: "inline", marginRight: 5 }} />
              Food Name
            </label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="e.g. Margherita Pizza"
              value={data.name}
              onChange={onChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={13} style={{ display: "inline", marginRight: 5 }} />
              Description
            </label>
            <textarea
              className="form-input"
              name="description"
              rows={4}
              placeholder="Describe the dish ingredients, taste, or preparation..."
              value={data.description}
              onChange={onChange}
              required
            />
          </div>

          {/* Category & Price */}
          <div className="add-form-row">
            <div className="form-group">
              <label className="form-label">
                <Layers size={13} style={{ display: "inline", marginRight: 5 }} />
                Category
              </label>
              <select
                className="form-input"
                name="category"
                value={data.category}
                onChange={onChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={13} style={{ display: "inline", marginRight: 5 }} />
                Price (USD)
              </label>
              <input
                className="form-input"
                type="number"
                name="price"
                placeholder="e.g. 12.99"
                value={data.price}
                onChange={onChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <button type="submit" className="add-submit-btn" disabled={loading}>
            <PlusCircle size={18} />
            {loading ? "Adding Item..." : "Add Food Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
