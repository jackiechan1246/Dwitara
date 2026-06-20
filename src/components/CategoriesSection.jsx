import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coordImages } from '../data/products';
import './CategoriesSection.css';

const graphicTeeImages = [
  '/NY emb. patch t-shirt , pastel brown (1).png',
  '/NY emb. patch t-shirt , pastel orange (1).png',
  '/NY emb. patch t-shirt , pastel white (1).png',
];

const categories = [
  { id: 1, title: 'Graphic Tees', link: '/category/graphic-tees', images: graphicTeeImages, subtitle: 'Everyday prints, elevated' },
  { id: 3, title: 'Co-ord Full Sets', link: '/category/coord-sets', images: coordImages, subtitle: 'Full sets, full statement' },
];

// Each card manages its own slide index independently
const CategoryCard = ({ category }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!category.images?.length) return;
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % category.images.length);
    }, 3000 + Math.random() * 500); // slight offset so cards don't sync
    return () => clearInterval(interval);
  }, [category.images]);

  return (
    <Link to={category.link} className="category-card" style={{ display: 'block', textDecoration: 'none' }}>
      <div className="category-image-slider">
        {category.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${category.title} ${index + 1}`}
            className={`category-slider-img ${index === idx ? 'active' : ''}`}
          />
        ))}
      </div>
      <div className="category-overlay">
        <p className="category-subtitle-tag">{category.subtitle}</p>
        <h3 className="category-title">{category.title}</h3>
        <span className="category-link">Shop Now →</span>
      </div>
    </Link>
  );
};

const CategoriesSection = () => {
  return (
    <section className="section-padding" id="categories">
      <div className="container">
        <div className="categories-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Curated essentials for your wardrobe</p>
        </div>

        <div className="categories-grid categories-grid--two">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

