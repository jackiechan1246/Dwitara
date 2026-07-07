import { ArrowRight } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src="/Dwitara banner image.png" alt="Dwitara Collection" className="hero-img" />
        <div className="hero-gradient-overlay"></div>
      </div>
      
      <div className="container hero-content animate-fade-in">
        <div className="hero-bottom-text">
          <span className="hero-subtitle">NEW COLLECTION</span>
          <h1 className="hero-title">Elevate Your Everyday</h1>
          <button className="btn-primary hero-btn" onClick={scrollToCategories}>
            Explore Collection <ArrowRight size={18} className="btn-icon" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
