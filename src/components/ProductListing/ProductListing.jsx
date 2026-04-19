import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from "../../Hooks/useFilter";
import './ProductListing.css';
import { fallbackImage } from '../../utils/placeholders';
import { useInfiniteScroll } from '../../Hooks/useInfiniteScroll';
import SkeletonProducts from '../Skeleton/SkeletonProducts';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

const ProductListing = ({ allProducts }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    filters,
    setFilters,
    mode,
    setMode,
    visibleProducts,
    totalItems,
    totalPages,
    setCurrentPage,
    currentPage,
    loadMore,
    hasMore,
    resetFeed,
  } = useFilters(allProducts);
  const [viewMode, setViewMode] = React.useState('grid');
  const [isLoading, setIsLoading] = React.useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const brands = React.useMemo(() => {
    const pool = new Set((allProducts ?? []).map((p) => p.brand));
    return ['All', ...pool];
  }, [allProducts]);

  const scrollTarget = useInfiniteScroll(loadMore, mode === 'infinite' && hasMore);

  React.useEffect(() => {
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort');
    const minRating = Number(searchParams.get('rating') ?? 0);
    const maxPrice = Number(searchParams.get('maxPrice') ?? 200);
    const view = searchParams.get('view');
    const displayMode = searchParams.get('mode');

    setFilters((prev) => ({
      ...prev,
      query: query ?? prev.query,
      category: category || prev.category,
      brand: brand || prev.brand,
      sortBy: sort || prev.sortBy,
      minRating: Number.isFinite(minRating) ? minRating : prev.minRating,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : prev.maxPrice,
    }));

    if (view === 'grid' || view === 'list') setViewMode(view);
    if (displayMode === 'pagination' || displayMode === 'infinite') setMode(displayMode);
  }, [searchParams, setFilters, setMode]);

  React.useEffect(() => {
    setSearchParams({
      query: filters.query,
      category: filters.category,
      brand: filters.brand,
      rating: String(filters.minRating),
      maxPrice: String(filters.maxPrice),
      sort: filters.sortBy,
      view: viewMode,
      mode,
    });
  }, [filters, viewMode, mode, setSearchParams]);

  React.useEffect(() => {
    setCurrentPage(1);
    resetFeed();
  }, [filters, mode, resetFeed, setCurrentPage]);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!allProducts || allProducts.length === 0) {
    return <h2>Loading Products...</h2>;
  }

  return (
    <div className="listing-page">
      <aside className="sidebar">
        <p className="sidebar-label">Filters</p>
        <label className="filter-group">
          <span>Category</span>
          <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
            <option value="All">All Categories</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Accessories">Accessories</option>
          </select>
        </label>

        <label className="filter-group">
          <span>Brand</span>
          <select value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>Minimum Rating: {filters.minRating.toFixed(1)}+</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
          />
        </label>

        <label className="filter-group">
          <span>Max Price: ${filters.maxPrice}</span>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          />
        </label>

        <label className="filter-group">
          <span>Sort</span>
          <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})}>
            <option value="default">Sort By</option>
            <option value="az">Name: A to Z</option>
            <option value="za">Name: Z to A</option>
            <option value="lowHigh">Price: Low to High</option>
            <option value="highLow">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>

        <label className="filter-group">
          <span>Feed Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="pagination">Pagination</option>
            <option value="infinite">Infinite Scroll</option>
          </select>
        </label>
      </aside>

     <main className="product-content">
      <div className="listing-header">
        <div>
          <h1>Shop Collection</h1>
          {filters.query ? <p>Search: "{filters.query}"</p> : null}
          <p>{totalItems} products matched</p>
        </div>
        <div className="view-options">
          <button 
            className={viewMode === 'grid' ? 'active' : ''} 
            onClick={() => setViewMode('grid')}
          >Grid View</button>
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={() => setViewMode('list')}
          >List View</button>
        </div>
      </div>

      {isLoading ? <SkeletonProducts count={6} /> : (
        <>
          <div className={`products-container ${viewMode}`}>
            {visibleProducts && visibleProducts.map((product) => (
              <div key={product.id} className="product-card">
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
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h4>{product.name}</h4>
                  <p className="meta">{product.brand} | {product.rating} star</p>
                  <p className="price">${product.price}</p>
                  <p className="desc">{product.description}</p>
                  <div className="card-actions">
                    <button
                      className="add-btn"
                      onClick={(e) => addItem(product, 1, { sourceX: e.clientX, sourceY: e.clientY })}
                    >
                      Add to Cart
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={`wish-btn ${wishlistItems.some((item) => item.id === product.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product)}
                    >
                      ♥
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!visibleProducts.length ? <p>No products found for the current filters.</p> : null}
        </>
      )}

      {mode === 'pagination' ? (
        <div className="pagination">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      ) : (
        <div ref={scrollTarget} className="infinite-anchor">
          {hasMore ? 'Loading more products...' : 'You reached the end'}
        </div>
      )}
</main>
    </div>
  );
};

export default ProductListing;