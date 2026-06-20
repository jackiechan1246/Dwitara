import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import CartSidebar from './CartSidebar';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { user } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleShake = () => {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    };

    const handleOpenAuth = () => {
      setIsAuthOpen(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cart-shake', handleShake);
    window.addEventListener('open-auth', handleOpenAuth);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-shake', handleShake);
      window.removeEventListener('open-auth', handleOpenAuth);
    };
  }, []);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="nav-left">
            <button className="icon-btn mobile-menu" aria-label="Menu"><Menu size={24} /></button>
            <div className="nav-links">
              <a href="#new-arrival" className="nav-link">New Arrivals</a>
              <a href="#categories" className="nav-link">Categories</a>
              <a href="#about" className="nav-link">About Us</a>
            </div>
          </div>

          <div className="nav-logo">
            <a href="/"><h1>DWITARA</h1></a>
          </div>

          <div className="nav-right">
            <button className="icon-btn" aria-label="Search"><Search size={20} /></button>
            
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <button 
                className="icon-btn" 
                onClick={() => setIsAuthOpen(true)} 
                aria-label="User Account"
              >
                <div className="user-icon-empty">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </button>
            )}

            <button 
              className={`icon-btn cart-btn ${shaking ? 'cart-shake' : ''}`}
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
            </button>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartSidebar />
    </>
  );
};

export default Navbar;
