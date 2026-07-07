import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import ProductList from '../components/ProductList';
import { dummyProducts } from '../data/products';

const Home = () => {
  // Select 8 distinct items for the home trending grid
  // 1: Pastel Brown Tee
  // 3: Pastel White Tee
  // 10: Denim embroidery co-ord set
  // 5: Acid wash Co-ord set
  // 8: Day dreamer mode co-ord set, black 
  // 17: Medusa emb. co-ord set, orange
  // 22: Studd denim co-ord set
  // 19: Ombre co-ord set, blue
  const trendingItems = dummyProducts.filter(p => [1, 3, 10, 5, 8, 17, 22, 19].includes(p.id));

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
