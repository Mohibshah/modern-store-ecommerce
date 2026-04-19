import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryGrid.css';
import { productImages, fallbackImage } from '../../utils/placeholders';

const CategoryGrid = () => {
  const navigate = useNavigate();
  const categories = [
    { id: 1, name: 'Men', img: productImages.men, gridArea: 'men' },
    { id: 2, name: 'Women', img: productImages.women, gridArea: 'women' },
    { id: 3, name: 'Accessories', img: productImages.accessories, gridArea: 'acc' },
    { id: 4, name: 'New Arrivals', img: productImages.arrivals, gridArea: 'new' },
  ];

  return (
    <section className="grid-section" id="collections">
      <div className="grid-header">
        <h2>Shop by Category</h2>
      </div>
      <div className="category-container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-card ${cat.gridArea}`}
            onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
          >
            <div className="zoom-wrapper">
              <img
                src={cat.img}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackImage) {
                    e.currentTarget.src = fallbackImage;
                  }
                }}
              />
              <div className="category-overlay">
                <h3>{cat.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;