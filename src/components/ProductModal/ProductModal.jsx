import React, { useState } from 'react';
import './ProductModal.css';

const ProductModal = ({
  product,
  quantity,
  setQuantity,
  isWishlisted,
  onAddToCart,
  onWishlistToggle,
  onClose,
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Black');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(10, Number(e.target.value)));
    setQuantity(value);
  };

  const decreaseQuantity = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    setQuantity(Math.min(10, quantity + 1));
  };

  const gallery = product.gallery || [product.image];

  return (
    <div className="product-modal-backdrop" onClick={handleBackdropClick}>
      <div className="product-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-content">
          {/* Left: Gallery */}
          <div className="modal-gallery">
            <div className="main-image">
              <img src={gallery[activeImage]} alt={product.name} loading="eager" decoding="async" />
            </div>
            <div className="thumbnail-strip">
              {gallery.map((image, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={image} alt={`${product.name} ${idx + 1}`} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="modal-details">
            <h2>{product.name}</h2>

            {/* Rating */}
            <div className="modal-rating">
              <div className="stars">
                {'⭐'.repeat(Math.floor(product.rating))}
                <span className="rating-value">({product.rating})</span>
              </div>
            </div>

            {/* Price */}
            <div className="modal-price">
              <span className="price">${product.price.toFixed(2)}</span>
              <span className="brand">{product.brand}</span>
            </div>

            {/* Description */}
            <p className="modal-description">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="modal-section">
                <label>Color: <strong>{selectedColor}</strong></label>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: color.toLowerCase(),
                        border:
                          color.toLowerCase() === 'white'
                            ? '2px solid #ddd'
                            : undefined,
                      }}
                      title={color}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="modal-section">
                <label>Size: <strong>{selectedSize}</strong></label>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="modal-section">
              <label>Quantity</label>
              <div className="quantity-control">
                <button onClick={decreaseQuantity} className="qty-btn">−</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max="10"
                  className="qty-input"
                />
                <button onClick={increaseQuantity} className="qty-btn">+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                className="btn-add-to-cart"
                onClick={onAddToCart}
              >
                Add to Cart
              </button>
              <button
                className={`btn-wishlist ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={onWishlistToggle}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Info */}
            <div className="modal-info">
              <p>✓ Free shipping on orders over $75</p>
              <p>✓ Easy returns within 30 days</p>
              <p>✓ Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
