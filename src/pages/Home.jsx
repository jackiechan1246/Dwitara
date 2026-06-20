import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import ProductList from '../components/ProductList';
import { dummyProducts } from '../data/products';

const Home = () => {
  // Select 8 distinct items for the home trending grid
  // 1: Pastel Brown Tee
  // 3: Pastel White Tee
  // 26: Ribbed Essential Tank
  // 5: Acid wash Co-ord set
  // 8: Day dreamer mode co-ord set, black 
  // 17: Medusa emb. co-ord set, orange
  // 22: Studd denim co-ord set
  // 27: Future Tank Top Placeholder
  const trendingItems = dummyProducts.filter(p => [1, 3, 26, 5, 8, 17, 22, 27].includes(p.id));

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <ProductList 
        title="Trending Now" 
        subtitle="Discover our most loved pieces" 
        products={trendingItems} 
      />
    </>
  );
};

export default Home;
