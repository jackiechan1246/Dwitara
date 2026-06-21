import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import DummyFeatures from './components/DummyFeatures';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>

      <DummyFeatures />

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
