import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import DummyFeatures from './components/DummyFeatures';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import OrdersPage from './pages/OrdersPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import FloatingCartButton from './components/FloatingCartButton';
import ReactPixel, { initMetaPixel } from './lib/metaPixel';

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only scroll to top if we are NOT navigating backwards (POP)
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}

function PixelTracker() {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
    ReactPixel.pageView();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <PixelTracker />
          <ScrollToTop />
          <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>

      <DummyFeatures />
      <FloatingCartButton />

        <footer style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          marginTop: '4rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>DWITARA</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Dwitara India. Mindfully crafted.
          </p>
        </footer>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
