import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, onSelectCategory, selectedCategory }) => {
  return (
    <div className="category-filter-container">
      {categories.map(category => (
        <button
          key={category}
          className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;