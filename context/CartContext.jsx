import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartItemCount } from '../services/CartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart count from backend
  const fetchCartCount = async () => {
    if (!user?.token) {
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await getCartItemCount(user.token);
      setCartCount(response.total_items || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Update cart count manually (for immediate updates)
  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

  // Refresh cart count from backend
  const refreshCartCount = () => {
    fetchCartCount();
  };

  // Fetch cart count when user changes
  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const value = {
    cartCount,
    loading,
    updateCartCount,
    refreshCartCount,
    fetchCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
