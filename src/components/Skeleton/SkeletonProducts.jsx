import React from 'react';
import './SkeletonProducts.css';

const SkeletonProducts = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image shimmer" />
          <div className="skeleton-line skeleton-title shimmer" />
          <div className="skeleton-line skeleton-price shimmer" />
          <div className="skeleton-line skeleton-desc shimmer" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonProducts;