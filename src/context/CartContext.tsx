'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  qty: number;
}

interface CartContextType {
  cart: { [itemId: string]: number };
  couponCode: string;
  couponApplied: boolean;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  changeQty: (itemId: string, delta: number) => void;
  applyCoupon: (code: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bitecraft_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
    const savedCoupon = localStorage.getItem('bitecraft_coupon_applied');
    if (savedCoupon === 'true') {
      setCouponApplied(true);
      setCouponCode(localStorage.getItem('bitecraft_coupon_code') || '');
    }
  }, []);

  // Save cart to localStorage on change
  const saveCart = (updatedCart: { [itemId: string]: number }) => {
    setCart(updatedCart);
    localStorage.setItem('bitecraft_cart', JSON.stringify(updatedCart));
  };

  const addToCart = (itemId: string) => {
    const updated = { ...cart, [itemId]: (cart[itemId] || 0) + 1 };
    saveCart(updated);
  };

  const removeFromCart = (itemId: string) => {
    const updated = { ...cart };
    delete updated[itemId];
    saveCart(updated);
  };

  const changeQty = (itemId: string, delta: number) => {
    const current = cart[itemId] || 0;
    const nextVal = current + delta;
    const updated = { ...cart };
    if (nextVal <= 0) {
      delete updated[itemId];
    } else {
      updated[itemId] = nextVal;
    }
    saveCart(updated);
  };

  const applyCoupon = (code: string): boolean => {
    const sanitized = code.trim().toUpperCase();
    if (sanitized === 'SAVE50') {
      setCouponApplied(true);
      setCouponCode(sanitized);
      localStorage.setItem('bitecraft_coupon_applied', 'true');
      localStorage.setItem('bitecraft_coupon_code', sanitized);
      return true;
    } else if (sanitized === '') {
      setCouponApplied(false);
      setCouponCode('');
      localStorage.removeItem('bitecraft_coupon_applied');
      localStorage.removeItem('bitecraft_coupon_code');
      return true;
    }
    return false;
  };

  const clearCart = () => {
    setCart({});
    setCouponApplied(false);
    setCouponCode('');
    localStorage.removeItem('bitecraft_cart');
    localStorage.removeItem('bitecraft_coupon_applied');
    localStorage.removeItem('bitecraft_coupon_code');
  };

  return (
    <CartContext.Provider value={{
      cart,
      couponCode,
      couponApplied,
      addToCart,
      removeFromCart,
      changeQty,
      applyCoupon,
      clearCart
    }}>
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
