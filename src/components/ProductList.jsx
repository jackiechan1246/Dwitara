import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import './ProductList.css';
import { dummyProducts } from '../data/products';
import SizeChartModal from './SizeChartModal';

const standardSizes = ['XS', 'S', 'M', 'L', 'XL'];
const coordSizes = ['M', 'L', 'XL'];

const ProductList = ({ title = "Trending Now", subtitle = "Discover our most loved pieces", products = dummyProducts }) => {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [sizeWarning, setSizeWarning] = useState(null); // product id that needs a size
  const [toast, setToast] = useState(null); // { name } of item just added
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const { addToCart, numCoords } = useCart();
  const navigate = useNavigate();

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    // Clear size warning if user just picked a size for the warned product
    if (sizeWarning === productId) setSizeWarning(null);
  };

  const handleColorSelect = (productId, color) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = (product) => {
    // 1. Check size selection
    if (!selectedSizes[product.id]) {
      setSizeWarning(product.id);
      // Auto-clear warning after 3s
      setTimeout(() => setSizeWarning(prev => prev === product.id ? null : prev), 3000);
      return;
    }

    const size = selectedSizes[product.id];
    const color = selectedColors[product.id] || (product.colors ? product.colors[0] : null);

    addToCart(product, size, color);

    // 2. Trigger cart shake animation
    window.dispatchEvent(new CustomEvent('cart-shake'));

    // 3. Show success toast (longer duration if it's a co-ord promo)
    setToast({ name: product.name, category: product.category });
    setTimeout(() => setToast(null), product.category === 'Co-ord Full Sets' ? 4500 : 2500);
  };

  return (
    <section className="section-padding product-section" id="trending">
      <div className="container">
        <div className="categories-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {product.originalPrice && (
                  <div className="discount-badge">LIMITED TIME</div>
                )}
                {product.images ? (
                  <div 
                    onClick={() => navigate(`/product/${product.id}`)} 
                    style={{ cursor: 'pointer', height: '100%', width: '100%', display: 'flex' }}
                  >
                    <img src={product.images.primary} alt={product.name} className="product-image product-image-primary" />
                    <img src={product.images.hover} alt={`${product.name} hover view`} className="product-image product-image-hover" />
                  </div>
                ) : (
                  <div 
                    className="product-image-placeholder"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="placeholder-text-small">IMG: {product.name}</span>
                  </div>
                )}

                <div className="product-actions">
                  {sizeWarning === product.id && (
                    <div className="size-popup-bubble" onClick={() => setSizeWarning(null)}>
                      Please select a size
                    </div>
                  )}
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                    <ShoppingBag size={18} /> Add to Cart
                  </button>
                </div>
              </div>

                <div className="product-info" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-price">
                    {product.category === 'Graphic Tees' && numCoords > 0 ? (
                      <>
                        <span className="original-price">₹{product.price}</span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>₹{Math.round(product.price * 0.5)}</span>
                        <span style={{ fontSize: '0.72rem', background: '#1C1B1A', color: '#fff', padding: '2px 7px', borderRadius: '20px', fontWeight: 500, marginLeft: '2px' }}>50% OFF</span>
                      </>
                    ) : (
                      <>
                        {product.originalPrice && (
                          <span className="original-price">₹{product.originalPrice}</span>
                        )}
                        <span style={product.originalPrice ? { color: 'var(--color-text-primary)', fontWeight: 700 } : {}}>
                          ₹{product.price}
                        </span>
                      </>
                    )}
                  </p>

                <div className="product-variants">
                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="variant-row">
                      <span className="variant-label">Color</span>
                      <div className="color-options">
                        {product.colors.map(color => (
                          <button
                            key={color}
                            className={`color-btn ${selectedColors[product.id] === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(product.id, color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  <div className="variant-row size-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.25rem' }}>
                      <span className="variant-label">Size</span>
                      <button className="size-guide-link" onClick={() => setIsSizeChartOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}>Size Guide</button>
                    </div>
                    <div className="size-options">
                      {(['Co-ord Full Sets', 'Graphic Tees'].includes(product.category) ? coordSizes : standardSizes).map(size => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSizes[product.id] === size ? 'selected' : ''} ${sizeWarning === product.id && !selectedSizes[product.id] ? 'size-pulse' : ''}`}
                          onClick={() => handleSizeSelect(product.id, size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Warning */}
                  {sizeWarning === product.id && (
                    <p className="size-warning">Please select a size first</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Toast / Notification */}
      {toast && (
        <div className="cart-toast" style={{ minWidth: toast.category === 'Co-ord Full Sets' ? '340px' : '200px' }}>
          <ShoppingBag size={16} />
          {toast.category === 'Co-ord Full Sets' ? (
            <span>
              <strong>🎉 Unlocked!</strong> Add any Graphic Tee for <strong>50% OFF</strong>!
            </span>
          ) : (
            <span>Added to your bag!</span>
          )}
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </section>
  );
};

export default ProductList;
