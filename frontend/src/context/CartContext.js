import React, { createContext, useContext, useState, useEffect } from 'react';
import { LOGOUT_EVENT } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from sessionStorage on initial render
  useEffect(() => {
    try {
      const cartData = sessionStorage.getItem('cart');
      setCartItems(cartData ? JSON.parse(cartData) : []);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      setCartItems([]);
    }
  }, []);

  // Watch for external changes to sessionStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        try {
          const newCartData = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(newCartData);
        } catch (error) {
          console.error('Error parsing cart data from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update cart items
  const updateCart = (items) => {
    setCartItems(items);
    sessionStorage.setItem('cart', JSON.stringify(items));
  };

  // Remove a specific item from cart
  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.book_id !== itemId);
    setCartItems(updatedItems);
    sessionStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('cart');
  };

  // Get total quantity
  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      clearCart();
    };
    
    window.addEventListener(LOGOUT_EVENT, handleLogout);
    
    return () => {
      window.removeEventListener(LOGOUT_EVENT, handleLogout);
    };
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      updateCart, 
      clearCart, 
      removeItem, 
      getTotalQuantity 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
