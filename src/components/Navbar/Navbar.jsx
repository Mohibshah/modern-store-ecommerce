import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { selectCartCount, useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { PRODUCTS } from '../../data/products';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  const [flyItem, setFlyItem] = useState(null);
  const cartButtonRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const initialTheme = localStorage.getItem('theme');
    if (initialTheme === 'dark') return true;
    if (initialTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const cartCount = useCartStore(selectCartCount);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const lastAddedName = useCartStore((state) => state.lastAddedName);
  const lastAddedImage = useCartStore((state) => state.lastAddedImage);
  const lastAddedX = useCartStore((state) => state.lastAddedX);
  const lastAddedY = useCartStore((state) => state.lastAddedY);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    if (!lastAddedAt) return;

    const targetRect = cartButtonRef.current?.getBoundingClientRect();
    const targetX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 40;
    const targetY = targetRect ? targetRect.top + targetRect.height / 2 : 48;
    const startX = Number.isFinite(lastAddedX) ? lastAddedX : window.innerWidth * 0.5;
    const startY = Number.isFinite(lastAddedY) ? lastAddedY : window.innerHeight * 0.68;

    setFlyItem({
      key: lastAddedAt,
      image: lastAddedImage,
      startX,
      startY,
      moveX: targetX - startX,
      moveY: targetY - startY,
    });

    setCartPulse(false);
    const frame = requestAnimationFrame(() => setCartPulse(true));
    setShowCartToast(true);
    const pulseTimer = setTimeout(() => setCartPulse(false), 700);
    const toastTimer = setTimeout(() => setShowCartToast(false), 1600);
    const flyTimer = setTimeout(() => setFlyItem(null), 760);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(pulseTimer);
      clearTimeout(toastTimer);
      clearTimeout(flyTimer);
    };
  }, [lastAddedAt, lastAddedImage, lastAddedX, lastAddedY]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 260);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSuggestions([]);
      return;
    }

    const term = debouncedSearch.toLowerCase();
    const nextSuggestions = PRODUCTS.filter((product) => {
      const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
      return haystack.includes(term);
    }).slice(0, 6);

    setSuggestions(nextSuggestions);
  }, [debouncedSearch]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = (event) => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);

    if (location.pathname === '/') {
      event.preventDefault();
      scrollToTop();
      return;
    }

    requestAnimationFrame(() => {
      scrollToTop();
    });
  };

  const closeMenus = () => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = search.trim();
    const params = new URLSearchParams();

    if (trimmed) {
      params.set('query', trimmed);
    }

    params.set('category', 'All');
    params.set('brand', 'All');
    params.set('rating', '0');
    params.set('maxPrice', '200');
    params.set('sort', 'default');
    params.set('view', 'grid');
    params.set('mode', 'pagination');

    navigate(`/shop?${params.toString()}`);
    setShowSuggestions(false);
    closeMenus();
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setSearch('');
    closeMenus();
  };

  return (
    <nav className={`navbar ${isSticky ? 'sticky' : ''}`}>
      <div className="logo">
        <Link to="/" aria-label="Modern Store home" onClick={handleHomeClick}>
          <img src={`${import.meta.env.BASE_URL}images/store-logo.svg`} alt="Modern Store" />
        </Link>
      </div>

      <form className="nav-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 160);
          }}
          aria-label="Search products"
        />
        {showSuggestions && debouncedSearch ? (
          <div className="search-suggestions" role="listbox" aria-label="Product suggestions">
            {suggestions.length ? suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                className="suggestion-item"
                onClick={() => handleSuggestionClick(product.id)}
              >
                <span>{product.name}</span>
                <small>{product.category}</small>
              </button>
            )) : (
              <p className="suggestion-empty">No matching products</p>
            )}
          </div>
        ) : null}
      </form>

      <ul className={`nav-links ${isMobileOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
        <li><Link to="/shop" onClick={closeMenus}>Shop</Link></li>
        <li>
          <Link to="/wishlist" onClick={closeMenus}>Wishlist ({wishlistCount})</Link>
        </li>
        <li className="cart-icon">
          <button
            ref={cartButtonRef}
            type="button"
            className={`cart-open-btn ${cartPulse ? 'pulse' : ''}`}
            onClick={() => {
            toggleCart();
            closeMenus();
          }}>
            <span>🛒</span>
            <span className={`cart-badge ${cartPulse ? 'pulse' : ''}`}>{cartCount}</span>
          </button>
        </li>
        <li className="user-menu">
          <button className="user-btn" onClick={() => setIsUserMenuOpen((prev) => !prev)} type="button">User ▾</button>
          {isUserMenuOpen ? (
            <div className="user-dropdown">
              <Link to="/wishlist" onClick={closeMenus}>Wishlist</Link>
              <Link to="/dashboard" onClick={closeMenus}>Dashboard</Link>
              <Link to="/login" onClick={closeMenus}>Login</Link>
            </div>
          ) : null}
        </li>
        <li>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </li>
      </ul>

      <button
        type="button"
        className="mobile-hamburger"
        aria-label="Toggle navigation menu"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <span>{isMobileOpen ? '✕' : '☰'}</span>
      </button>

      {isMobileOpen ? <button type="button" className="mobile-backdrop" onClick={closeMenus} aria-label="Close menu" /> : null}

      {flyItem ? (
        <div
          key={flyItem.key}
          className="cart-fly-image"
          style={{
            left: `${flyItem.startX}px`,
            top: `${flyItem.startY}px`,
            '--fly-x': `${flyItem.moveX}px`,
            '--fly-y': `${flyItem.moveY}px`,
          }}
          aria-hidden="true"
        >
          <img src={flyItem.image} alt="" />
        </div>
      ) : null}

      <div className={`cart-toast ${showCartToast ? 'show' : ''}`}>
        Added to cart: {lastAddedName || 'Item'}
      </div>
    </nav>
  );
};

export default Navbar;