import { toast } from "react-toastify";
import React, { useState } from "react";
import "./Add.css";
//import { assets } from "@/assets/assets.js";
import axios from "axios";

const Add = ({ url }) => {
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salads",
    image: "", // ✅ Now image is a URL string
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

 const onSubmitHandler = async (event) => {
  event.preventDefault();

  try {
    const response = await axios.post(`${url}/api/food/add`, {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      image: data.image, // ✅ sending url only
    });

    if (response.data.success) {
      toast.success("Food Added Successfully");
      setData({
        name: "",
        description: "",
        price: "",
        category: "Salads",
        image: "",
      });
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("Error adding food:", error);
    toast.error("Something went wrong.");
  }
};


  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-product-image flex-col">
  <p>Image URL</p>
  <input
    type="text"
    name="image"
    placeholder="https://example.com/image.jpg"
    value={data.image}
    onChange={onChangeHandler}
    required
  />
</div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          ></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
              <option value="Biryani">Biryani</option>
              <option value="Pizza">Pizza</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="$20"
              required
            />
          </div>
        </div>

        <button type="submit" className="add-btn">ADD</button>
      </form>
    </div>
  );
};

export default Add;
