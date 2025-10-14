import React, { useContext } from 'react';
import sandwichImg from '../assets/sandwich.jpg';
import dosaImg from '../assets/dosa.jpg';
import friesImg from '../assets/fries.jpg';
import burgerImg from '../assets/burger.jpg';
import pizzaImg from '../assets/pizza.jpg';
import pastaImg from '../assets/pasta.jpg';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

import '../styles/Menu.css';

export default function Menu() {
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  const menuItems = [
    { id: 1, name: 'Burger', img: burgerImg, price: 120 },
    { id: 2, name: 'Pizza', img: pizzaImg, price: 250 },
    { id: 3, name: 'Pasta', img: pastaImg, price: 180 },
    { id: 4, name: 'Sandwich', img: sandwichImg, price: 90 },
    { id: 5, name: 'Dosa', img: dosaImg, price: 110 },
    { id: 6, name: 'Fries', img: friesImg, price: 70 }
  ];

  return (
    <div className="menu-container">
      <h2 className="section-title">🍔 Our Menu</h2>
      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item.id} className="menu-card">
            <img src={item.img} alt={item.name} />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <button
              onClick={() => {
                addToCart(item);
                notify(`${item.name} added to cart`, 'success');
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
