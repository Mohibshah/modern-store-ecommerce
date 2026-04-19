import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: Brand Info */}
        <div className="footer-col">
          <h3 className="footer-logo">MODERN_STORE</h3>
          <p className="footer-desc">
            Premium quality digital fashion for the modern era. Elevating your everyday style since 2026.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>

        {/* Column 2: Sitemap */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop?category=All&sort=default&mode=pagination&view=grid">New Arrivals</Link></li>
            <li><Link to="/shop?category=All&sort=rating&mode=pagination&view=grid">Best Sellers</Link></li>
            <li><Link to="/shop?category=Men&mode=pagination&view=grid">Men's Collection</Link></li>
            <li><Link to="/shop?category=Women&mode=pagination&view=grid">Women's Collection</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/checkout">Shipping Policy</Link></li>
            <li><Link to="/checkout">Returns & Exchanges</Link></li>
            <li><Link to="/dashboard">FAQs</Link></li>
            <li><Link to="/dashboard">Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="footer-col">
          <h4>Newsletter</h4>
          <p>Subscribe to get special offers and first looks.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Modern Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;