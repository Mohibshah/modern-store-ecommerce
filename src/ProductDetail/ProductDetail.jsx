import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductDetail.css';
import { productImages, fallbackImage } from '../utils/placeholders';
import { useProduct } from '../Hooks/useProduct';
import { PRODUCTS } from '../data/products';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

const ProductDetail = () => {
  const { id } = useParams();
  const { product, relatedProducts } = useProduct(PRODUCTS, id);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image || productImages.denim);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const addItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  React.useEffect(() => {
    if (!product) return;
    const key = `reviews-product-${product.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setReviews(JSON.parse(saved));
      return;
    }

    const starterReviews = [
      { name: 'Sarah', rating: 5, text: 'Love the fit and texture. Great everyday piece.' },
      { name: 'Imran', rating: 4, text: 'Good value for price, color looks premium.' },
    ];
    setReviews(starterReviews);
    localStorage.setItem(key, JSON.stringify(starterReviews));
  }, [product]);

  if (!product) {
    return (
      <div className="product-detail-page">
        <h2>Product not found.</h2>
      </div>
    );
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image, fallbackImage];

  const wishlisted = wishlistItems.some((item) => item.id === product.id);

  const submitReview = (event) => {
    event.preventDefault();

    const nextReview = {
      name: reviewName.trim() || 'Guest',
      rating: Number(reviewRating),
      text: reviewText.trim(),
    };

    if (!nextReview.text) return;

    const nextReviews = [nextReview, ...reviews];
    setReviews(nextReviews);
    localStorage.setItem(`reviews-product-${product.id}`, JSON.stringify(nextReviews));

    setReviewName('');
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <div className="product-detail-page">
      <div className="detail-container">
        <div className="image-section">
          <div className="main-img-wrapper">
            <img 
              src={activeImage}
              alt={product.name}
              className="zoom-effect"
              loading="eager"
              decoding="async"
              onError={(e) => {
                if (e.currentTarget.src !== fallbackImage) {
                  e.currentTarget.src = fallbackImage;
                }
              }}
            />
          </div>
          <div className="thumb-row">
            {gallery.map((image, idx) => (
              <button
                key={`${product.id}-${idx}`}
                className={`thumb-btn ${activeImage === image ? 'active' : ''}`}
                onClick={() => setActiveImage(image)}
                type="button"
              >
                <img src={image} alt={`${product.name} preview ${idx + 1}`} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>

        <div className="info-section">
          <p className="breadcrumb">Home / Shop / {product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>
          <p className="meta-line">Brand: {product.brand} | Rating: {product.rating}</p>
          
          <div className="size-selector">
            <h4>Select Size</h4>
            <div className="size-btns">
              {product.sizes.map(size => (
                <button 
                  key={size} 
                  className={selectedSize === size ? 'active' : ''}
                  onClick={() => setSelectedSize(size)}
                >{size}</button>
              ))}
            </div>
          </div>

          <div className="size-selector">
            <h4>Select Color</h4>
            <div className="size-btns">
              {product.colors.map(color => (
                <button
                  key={color}
                  className={selectedColor === color ? 'active' : ''}
                  onClick={() => setSelectedColor(color)}
                >{color}</button>
              ))}
            </div>
          </div>

          <div className="quantity-control">
            <h4>Quantity</h4>
            <div className="q-btns">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          <div className="action-btns">
            <button
              className="add-to-cart-btn"
              onClick={(e) => addItem(product, quantity, { sourceX: e.clientX, sourceY: e.clientY })}
            >
              Add to Cart
            </button>
            <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
              {wishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          <section className="reviews">
            <h3>Reviews</h3>
            <form className="review-form" onSubmit={submitReview}>
              <input
                type="text"
                placeholder="Your name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
              />
              <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
              <textarea
                placeholder="Write your review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
              />
              <button type="submit">Submit Review</button>
            </form>

            <div className="review-list">
              {reviews.map((item, idx) => (
                <article key={`${item.name}-${idx}`} className="review-card">
                  <p><strong>{item.name}</strong> · {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="related-strip">
        <h3>Related Products</h3>
        <div className="related-grid">
          {relatedProducts.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="related-card">
              <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;