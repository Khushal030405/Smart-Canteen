import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import "../styles/Home.css";

import burger from "../assets/burger.jpg";
import dosa from "../assets/dosa.jpg";
import pizza from "../assets/pizza.jpg";

function Home() {
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  const specials = [
    { id: 1, name: "Cheese Burger", img: burger, price: 120 },
    { id: 2, name: "Masala Dosa", img: dosa, price: 90 },
    { id: 3, name: "Italian Pizza", img: pizza, price: 150 },
  ];

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-eyebrow">Welcome to Smart Canteen</p>
          <h1 className="home-title">Delicious Meals, Delivered Smartly.</h1>
          <p className="home-subtitle">
            Skip the queue and discover chef-crafted dishes tailored for campus life.
            Fresh ingredients, lightning-fast service, and a menu that keeps evolving.
          </p>
          <div className="home-actions">
            <Link className="home-primary" to="/menu">Explore Menu</Link>
            <Link className="home-secondary" to="/orders">Track Orders</Link>
          </div>
        </div>
        <div className="home-hero-visual">
          <div className="home-hero-card">
            <img src={pizza} alt="Wood-fired pizza" />
            <div className="home-hero-card-info">
              <span className="hero-pill">Best Seller</span>
              <h3>Italian Fiesta Pizza</h3>
              <p>Wood-fired perfection with garden fresh toppings.</p>
            </div>
          </div>
          <div className="home-hero-badge">
            <strong>24k+</strong>
            <span>Orders served</span>
          </div>
        </div>
      </section>

      <div className="specials-header">
        <h2>Today’s Chef Picks</h2>
        <p>Handpicked favourites crafted to brighten your day.</p>
      </div>

      <div className="specials-grid">
        {specials.map((item) => (
          <div className="special-card" key={item.id}>
            <img src={item.img} alt={item.name} />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <button
              className="order-btn"
              onClick={() => {
                addToCart(item);
                notify(`${item.name} added to cart`, "success");
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
