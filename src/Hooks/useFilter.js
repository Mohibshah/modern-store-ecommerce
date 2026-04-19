import { useState, useMemo } from 'react';

export const useFilters = (products) => {
  const [filters, setFilters] = useState({
    query: '',
    category: 'All',
    brand: 'All',
    minRating: 0,
    maxPrice: 200,
    sortBy: 'default',
  });
  const [mode, setMode] = useState('pagination');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  const filteredProducts = useMemo(() => {
    let result = products ? [...products] : [];

    if (filters.query.trim()) {
      const term = filters.query.trim().toLowerCase();
      result = result.filter((p) => {
        const haystack = `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    if (filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.brand !== 'All') {
      result = result.filter(p => p.brand === filters.brand);
    }

    result = result.filter(p => p.rating >= filters.minRating);
    result = result.filter(p => p.price <= filters.maxPrice);

    if (filters.sortBy === 'az') result.sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sortBy === 'za') result.sort((a, b) => b.name.localeCompare(a.name));
    if (filters.sortBy === 'lowHigh') result.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'highLow') result.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const infiniteProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const visibleProducts = mode === 'infinite' ? infiniteProducts : paginatedProducts;

  const loadMore = () => {
    if (mode !== 'infinite') return;
    setVisibleCount(prev => Math.min(prev + itemsPerPage, filteredProducts.length));
  };

  return {
    filters,
    setFilters,
    mode,
    setMode,
    visibleProducts,
    totalItems: filteredProducts.length,
    totalPages,
    setCurrentPage, 
    currentPage,
    loadMore,
    hasMore: visibleCount < filteredProducts.length,
    resetFeed: () => setVisibleCount(itemsPerPage),
  };
};