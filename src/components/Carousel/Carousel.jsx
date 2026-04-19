import React, { useRef, useState } from 'react';
import './Carousel.css';
import { fallbackImage } from '../../utils/placeholders';
import { PRODUCTS } from '../../data/products';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import ProductModal from '../ProductModal/ProductModal';

const Carousel = () => {
  const scrollRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.id === selectedProduct?.id)
  );

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;

    if (direction === 'left') {
      current.scrollLeft -= 300;
    } else {
      current.scrollLeft += 300;
    }
  };

  const products = PRODUCTS.slice(0, 5);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleAddToCart = (event) => {
    if (!selectedProduct) return;
    addItem(selectedProduct, quantity, {
      sourceX: event?.clientX,
      sourceY: event?.clientY,
    });
    closeProductModal();
  };

  const handleWishlistToggle = () => {
    if (!selectedProduct) return;
    toggleWishlist(selectedProduct);
  };

  return (
    <>
      <section className="carousel-section">
        <div className="carousel-header">
          <h2>Featured Products</h2>
          <div className="carousel-controls">
            <button onClick={() => scroll('left')}>←</button>
            <button onClick={() => scroll('right')}>→</button>
          </div>
        </div>

        <div
          className="carousel-container"
          ref={scrollRef}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              role="button"
              tabIndex={0}
              onClick={() => openProductModal(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  openProductModal(product);
                }
              }}
            >
              <div className="product-image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              </div>
              <div className="product-card-body">
                <h3>{product.name}</h3>
                <p>${product.price}</p>
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
          onClose={closeProductModal}
        />
      )}
    </>
  );
};

export default Carousel;