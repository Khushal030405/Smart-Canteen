import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { clearCart } = useContext(CartContext);

  const handleLogout = () => {
    clearCart();
    logout();
    navigate("/signup", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">Smart Canteen</div>
      <ul className="nav-links">
        {isAdmin ? (
          <>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </>
        )}
      </ul>
      <div className="nav-actions">
        {user && <span className="nav-user">Hi, {user.name}</span>}
        <button className="nav-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
