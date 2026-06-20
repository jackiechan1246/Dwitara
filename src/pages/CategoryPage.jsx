import React from 'react';
import ProductList from '../components/ProductList';
import { dummyProducts } from '../data/products';
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
  const { id } = useParams();

  // Configure category info based on url slug
  let categoryTitle = "Category details";
  let categoryDesc = "Viewing items.";
  let filterCategory = "";

  if (id === 'coord-sets') {
    categoryTitle = "Co-ord Full Sets";
    categoryDesc = "Complete matching ensembles for effortless style.";
    filterCategory = "Co-ord Full Sets";
  } else if (id === 'graphic-tees') {
    categoryTitle = "Graphic Tees";
    categoryDesc = "Bold prints and casual comfort for your everyday look.";
    filterCategory = "Graphic Tees";
  }

  const filteredProducts = filterCategory
    ? dummyProducts.filter(p => p.category === filterCategory && p.images)
    : [];

  return (
    <div style={{ paddingTop: '20px', minHeight: '80vh' }}>
      <ProductList
        title={categoryTitle}
        subtitle={categoryDesc}
        products={filteredProducts}
      />
    </div>
  );
};

export default CategoryPage;
