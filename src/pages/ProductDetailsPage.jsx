import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { dummyProducts } from '../data/products';
import SizeChartModal from '../components/SizeChartModal';
import './ProductDetailsPage.css';

const standardSizes = ['XS', 'S', 'M', 'L', 'XL'];
const coordSizes = ['M', 'L', 'XL'];

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, numCoords } = useCart();
  
  const product = dummyProducts.find(p => p.id === parseInt(id));
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('primary'); // 'primary' or 'hover'
  
  const imageRef = useRef(null);

  useEffect(() => {
    // Automatically select the first color if available
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pdp-section container">
        <h2>Product not found.</h2>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const sizesToUse = ['Co-ord Full Sets', 'Graphic Tees'].includes(product.category) ? coordSizes : standardSizes;

  // Pricing logic (same as product list)
  let displayPrice = product.price;
  let isDiscounted = false;
  
  if (product.category === 'Graphic Tees' && numCoords > 0) {
    displayPrice = Math.round(product.price * 0.5);
    isDiscounted = true;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeWarning(true);
      return;
    }
    
    // For products offering promo, we need to add real price logic if not handled deeply, 
    // but CartContext automatically computes promoDiscount on graphic tees regardless of the added price.
    addToCart(product, selectedSize, selectedColor);
    
    // Dispatch cart shake
    window.dispatchEvent(new CustomEvent('cart-shake'));
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = `${x}% ${y}%`;
      imageRef.current.style.transform = 'scale(2)';
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = 'center center';
      imageRef.current.style.transform = 'scale(1)';
    }
  };

  const currentImageSrc = product.images ? product.images[activeImage] : null;

  return (
    <section className="pdp-section">
      <div className="container">
        <button className="pdp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to browsing
        </button>
        
        <div className="pdp-container">
          {/* LEFT: Image Gallery */}
          <div className="pdp-image-col">
            <div 
              className="pdp-main-image-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {currentImageSrc ? (
                <img 
                  ref={imageRef}
                  src={currentImageSrc} 
                  alt={product.name} 
                  className="pdp-main-image" 
                />
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center' }}>No image available</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.hover && (
              <div className="pdp-thumbnails">
                <img 
                  src={product.images.primary} 
                  className={`pdp-thumbnail ${activeImage === 'primary' ? 'active' : ''}`}
                  onClick={() => setActiveImage('primary')}
                  alt="Front view"
                />
                <img 
                  src={product.images.hover} 
                  className={`pdp-thumbnail ${activeImage === 'hover' ? 'active' : ''}`}
                  onClick={() => setActiveImage('hover')}
                  alt="Alternate view"
                />
              </div>
            )}
          </div>
          
          {/* RIGHT: Product Details */}
          <div className="pdp-details-col">
            <span className="pdp-category">{product.category}</span>
            <h1 className="pdp-title">{product.name}</h1>
            
            <div className="pdp-price-wrap">
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {isDiscounted ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 700 }}>₹{displayPrice.toLocaleString('en-IN')}</span>
                  <span className="pdp-discount-badge">50% OFF</span>
                </>
              ) : (
                <span style={{ fontWeight: 600 }}>₹{displayPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            
            <p className="pdp-description">
              {product.description || "Designed for maximum comfort and unparalleled style. Mindfully crafted to be a timeless addition to your everyday wardrobe."}
            </p>
            
            {(product.fabric || product.fit) && (
              <div className="pdp-meta">
                {product.fit && <div className="pdp-meta-item"><strong>Fit:</strong> {product.fit}</div>}
                {product.fabric && <div className="pdp-meta-item"><strong>Fabric:</strong> {product.fabric}</div>}
              </div>
            )}
            
            <div className="pdp-variants">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="variant-row">
                  <span className="variant-label">Color</span>
                  <div className="color-options" style={{ display: 'flex', gap: '0.5rem' }}>
                    {product.colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color, width: '24px', height: '24px', borderRadius: '50%', border: selectedColor === color ? '2px solid #000' : '1px solid #ddd', padding: 0 }}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sizes */}
              <div className="variant-row size-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="variant-label">Size</span>
                  <button onClick={() => setIsSizeChartOpen(true)} style={{ background: 'none', border: 'none', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Size Guide</button>
                </div>
                <div className="size-options" style={{ display: 'flex', gap: '0.5rem' }}>
                  {sizesToUse.map(size => (
                    <button
                      key={size}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        border: selectedSize === size ? '1px solid #000' : '1px solid #ddd',
                        background: selectedSize === size ? '#000' : '#fff',
                        color: selectedSize === size ? '#fff' : '#000',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeWarning(false);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeWarning && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>Please select a size first.</span>}
              </div>
            </div>
            
            <button className="btn-primary pdp-add-to-cart" onClick={handleAddToCart}>
              <ShoppingBag size={20} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
      
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </section>
  );
};

export default ProductDetailsPage;
