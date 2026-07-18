import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './FloatingCartButton.css';

const FloatingCartButton = () => {
  const { cartItems, setIsCartOpen, isCartOpen } = useCart();
  const location = useLocation();

  // Do not show if cart is empty, cart sidebar is currently open, or user is already on checkout/orders pages
  if (cartItems.length === 0 || isCartOpen || ['/checkout', '/orders'].includes(location.pathname)) {
    return null;
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="floating-cart-wrapper">
      <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Proceed to Cart">
        <ShoppingBag size={20} />
        <span>Proceed to Cart ({totalItems})</span>
      </button>
    </div>
  );
};

export default FloatingCartButton;
