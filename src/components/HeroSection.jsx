import { ArrowRight } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        {/* Placeholder for user's full cover image: */}
        <div className="hero-image-placeholder">
          <span className="placeholder-text">Hero Image Placeholder</span>
        </div>
      </div>
      
      <div className="container hero-content animate-fade-in">
        <div className="hero-text-box">
          <span className="hero-subtitle">NEW COLLECTION</span>
          <h1 className="hero-title">Elevate Your Everyday</h1>
          <p className="hero-desc">
            Discover mindfully crafted silhouettes for the modern woman. Effortless style, unmatched comfort.
          </p>
          <button className="btn-primary hero-btn">
            Explore Collection <ArrowRight size={18} className="btn-icon" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
