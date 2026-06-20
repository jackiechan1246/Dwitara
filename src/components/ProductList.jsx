import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductList.css';
import { dummyProducts } from '../data/products';

const sizes = ['XS', 'S', 'M', 'L', 'XL'];

const ProductList = ({ title = "Trending Now", subtitle = "Discover our most loved pieces", products = dummyProducts }) => {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [sizeWarning, setSizeWarning] = useState(null); // product id that needs a size
  const [toast, setToast] = useState(null); // { name } of item just added
  const { addToCart } = useCart();

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

    // 3. Show success toast
    setToast({ name: product.name });
    setTimeout(() => setToast(null), 2500);
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
                {product.images ? (
                  <>
                    <img src={product.images.primary} alt={product.name} className="product-image product-image-primary" />
                    <img src={product.images.hover} alt={`${product.name} hover view`} className="product-image product-image-hover" />
                  </>
                ) : (
                  <div className="product-image-placeholder">
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

              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">₹{product.price}</p>

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
                  <div className="variant-row">
                    <span className="variant-label">Size</span>
                    <div className="size-options">
                      {sizes.map(size => (
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

      {/* Success Toast */}
      {toast && (
        <div className="cart-toast">
          <ShoppingBag size={16} />
          <span>Added to your bag!</span>
        </div>
      )}
    </section>
  );
};

export default ProductList;
