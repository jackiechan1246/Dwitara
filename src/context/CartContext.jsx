import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import ReactPixel from '../lib/metaPixel';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dwitara_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Filter out any stale items that are missing critical fields
      return parsed.filter(item => item && item.id && item.category && item.price);
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('dwitara_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, color) => {
    setCartItems(prev => {
      // Check if same product, same size, same color exists
      const existing = prev.find(item => 
        item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });

    ReactPixel.track("AddToCart", {
      value: product.price,
      currency: "INR"
    });
  };

  const removeFromCart = (indexToRemove) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      return prev.map((item, idx) => {
        if (idx === index) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQ) };
        }
        return item;
      });
    });
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // 1. Calculate absolute base savings (originalPrice - price)
  const absoluteSavings = cartItems.reduce((savings, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return savings + (item.originalPrice - item.price) * item.quantity;
    }
    return savings;
  }, 0);

  // 2. Buy 1 Co-ord set get 50% off any 1 Graphic tee logic (Limit to 2)
  let promoDiscount = 0;
  const numCoords = cartItems.reduce((acc, item) => item.category === 'Co-ord Full Sets' ? acc + item.quantity : acc, 0);
  
  if (numCoords > 0) {
    const maxTeesToDiscount = Math.min(numCoords, 2);
    // Find all graphic tees in cart, expand by quantity
    const graphicTees = cartItems.filter(item => item.category === 'Graphic Tees');
    let allTees = [];
    graphicTees.forEach(tee => {
      for (let i = 0; i < tee.quantity; i++) {
        allTees.push(tee.price);
      }
    });

    if (allTees.length > 0) {
      // Sort highest price first to give them 50% off the most expensive tees
      allTees.sort((a, b) => b - a);
      for (let i = 0; i < Math.min(allTees.length, maxTeesToDiscount); i++) {
        promoDiscount += allTees[i] * 0.5;
      }
    }
  }
  // 3. Login discount: 5% off the subtotal after promo for logged-in users
  const { user } = useAuth();
  const loginDiscount = user ? Math.round((cartTotal - promoDiscount) * 0.05) : 0;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal,
      absoluteSavings,
      promoDiscount,
      loginDiscount,
      numCoords,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
