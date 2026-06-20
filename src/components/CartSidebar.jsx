import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react';
import './CartSidebar.css';

const CartSidebar = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [view, setView] = useState('cart'); // 'cart', 'success' (checkout removed)
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth'));
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const closeSidebar = () => {
    setIsCartOpen(false);
    setTimeout(() => setView('cart'), 300); // reset view after closing animation
  };

  return (
    <>
      <div className="cart-overlay" onClick={closeSidebar}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>

        <div className="cart-header">
          <h2>{view === 'cart' ? 'Your Cart' : view === 'checkout' ? 'Delivery Details' : 'Order Confirmed'}</h2>
          <button className="cart-close" onClick={closeSidebar}><X size={24} /></button>
        </div>

        <div className="cart-body">
          {view === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <p>Your bag is empty.</p>
                  <button className="btn-primary" onClick={closeSidebar}>Continue Shopping</button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-img">
                        <img src={item.images?.primary || ''} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p className="cart-item-variant">
                          Size: {item.selectedSize}
                          {item.selectedColor && (
                            <span className="color-dot" style={{ backgroundColor: item.selectedColor }}></span>
                          )}
                        </p>
                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button onClick={() => updateQuantity(index, -1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)}>+</button>
                          </div>
                          <p className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(index)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {cartItems.length > 0 && view !== 'success' && (
          <div className="cart-footer">
            {view === 'cart' && (
              <>
                <div className="cart-total-row">
                  <span>Subtotal</span>
                  <span className="cart-total-price">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {!user && (
                  <div className="cart-promo-box" style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e' }}>
                    <strong>Log in now</strong> to unlock an instant <strong>5% discount!</strong> Plus an extra 5% off if you pay online.
                  </div>
                )}
                
                <p className="cart-shipping-note">Taxes and shipping calculated at checkout</p>
                <button className="cart-checkout-btn" onClick={handleProceedToCheckout}>
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default CartSidebar;
