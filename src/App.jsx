import React from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add/Add.jsx";
import List from "./pages/List/List.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddRestaurant from "./pages/addRestaurant/addRestaurant.jsx";
import ListRestaurants from "./pages/listRestaurant/listRestaurant.jsx";


const App = () => {
  const url = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://fooddel-backend-rux6.onrender.com";
  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
    <Routes>
  <Route path="/add" element={<Add url={url} />} />
  <Route path="/list" element={<List url={url} />} />
  <Route path="/orders" element={<Orders url={url} />} />

  {/* restaurant management */}
   <Route path="/add-restaurant" element={<AddRestaurant url={url} />} />
  <Route path="/manage-restaurants" element={<ListRestaurants url={url} />} />
</Routes>


      </div>
    </div>
  );
};

export default App;
