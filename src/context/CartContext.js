import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const getItemId = (item) => item.id || item._id;
  const normalizeId = (value) => (value !== undefined && value !== null ? value.toString() : "");

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const itemId = normalizeId(getItemId(item));
      const existingItem = prevItems.find(
        (cartItem) => normalizeId(getItemId(cartItem)) === itemId
      );
      if (existingItem) {
        return prevItems.map((cartItem) =>
          normalizeId(getItemId(cartItem)) === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => normalizeId(getItemId(item)) !== normalizeId(itemId))
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
