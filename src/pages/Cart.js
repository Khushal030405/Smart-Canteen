import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { getApiUrl } from "../utils/api";
import "../styles/Cart.css";

function Cart() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const handlePlaceOrder = async () => {
    if (!user || !token) {
      notify("Please login to place an order", "error");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      notify("Your cart is empty", "warning");
      return;
    }

    try {
      const orderItems = cartItems
        .map((item) => {
          const menuItemId = item._id || item.id;
          if (!menuItemId) {
            return null;
          }
          return {
            menuId: menuItemId.toString(),
            quantity: item.quantity
          };
        })
        .filter(Boolean);

      if (orderItems.length === 0) {
        notify("Cart items are invalid", "error");
        return;
      }

  const res = await fetch(getApiUrl('/api/orders'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalPrice: Number(totalPrice.toFixed(2))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Failed to place order", "error");
        return;
      }

      notify("Order placed successfully", "success");
      clearCart();
      navigate("/orders");
    } catch (err) {
      notify("Server error while placing order", "error");
    }
  };

  return (
    <div className="cart-container">
      <h1>Your Cart 🛒</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => {
              const itemId = item._id || item.id;
              const itemName = item.name || item.itemName || "Menu Item";
              const itemImage = item.img || item.image;
              return (
                <li key={itemId} className="cart-item">
                  {itemImage && <img src={itemImage} alt={itemName} />}
                  <div>
                    <h3>{itemName}</h3>
                    <p>₹{Number(item.price || 0).toFixed(2)} x {item.quantity}</p>
                  </div>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(itemId)}>Remove</button>
                </li>
              );
            })}
          </ul>
          <div className="cart-summary">
            <p>Total: ₹{totalPrice.toFixed(2)}</p>
            <div className="cart-actions">
              <button className="cart-clear-btn" onClick={clearCart}>Clear Cart</button>
              <button className="cart-order-btn" onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
