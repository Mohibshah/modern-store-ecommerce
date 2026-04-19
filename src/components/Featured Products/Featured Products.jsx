import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { PRODUCTS } from '../../data/products';
import ProductModal from '../ProductModal/ProductModal';
import './Featured Products.css';

const FeaturedProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) =>
    state.items.find((item) => item?.id === selectedProduct?.id)
  );

  const featuredIds = [1, 2, 3, 4];
  const featured = PRODUCTS.filter((p) => featuredIds.includes(p.id));

  const handleAddToCart = (event) => {
    if (selectedProduct) {
      addItem(selectedProduct, quantity, {
        sourceX: event?.clientX,
        sourceY: event?.clientY,
      });
      setQuantity(1);
      setTimeout(() => setSelectedProduct(null), 500);
    }
  };

  const handleWishlistToggle = () => {
    if (selectedProduct) {
      toggleWishlist(selectedProduct);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <>
      <section className="featured-products">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <div className="featured-controls">
            <button className="featured-nav prev" aria-label="Previous">←</button>
            <button className="featured-nav next" aria-label="Next">→</button>
          </div>
        </div>

        <div className="featured-grid">
          {featured.map((product) => (
            <div
              key={product.id}
              className="featured-card"
              onClick={() => openModal(product)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openModal(product);
                }
              }}
            >
              <div className="featured-image-wrapper">
                <img src={product.image} alt={product.name} className="featured-image" />
                <div className="featured-overlay">
                  <button className="featured-quick-view">Quick View</button>
                </div>
              </div>
              <div className="featured-info">
                <h3>{product.name}</h3>
                <p className="featured-description">{product.description}</p>
                <div className="featured-footer">
                  <span className="featured-price">${product.price.toFixed(2)}</span>
                  <div className="featured-rating">
                    {'⭐'.repeat(Math.floor(product.rating))}
                    <span className="rating-number">({product.rating})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          isWishlisted={!!isWishlisted}
          onAddToCart={handleAddToCart}
          onWishlistToggle={handleWishlistToggle}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default FeaturedProducts;
