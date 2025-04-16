import React, { useState } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import SortDropdown from '../components/ui/SortDropdown';
import FiltersSidebar from '../components/ui/FiltersSidebar';
import BooksGrid from '../components/ui/BooksGrid';
import { useBooks } from '../hooks/useBooks';

// Hardcoded categories
const categories = ['Fiction', 'Non-Fiction', 'Science', 'Fantasy', 'Bibliography'];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const { books, isLoading, error } = useBooks(searchQuery);
  const [showFilters, setShowFilters] = useState(!!categoryFromUrl);
  const [filters, setFilters] = useState({
    category: categoryFromUrl || '',
    priceRange: { min: 0, max: 100 },
    rating: 0
  });
  const [sortBy, setSortBy] = useState('popularity');

  // Filter books for remaining criteria (category, price, rating)
  const filteredBooks = books.filter(book => {
    const matchesCategory = !filters.category || book.category === filters.category;
    const matchesPrice = book.price >= filters.priceRange.min && book.price <= filters.priceRange.max;
    const matchesRating = !filters.rating || book.rating >= filters.rating;

    return matchesCategory && matchesPrice && matchesRating;
  });

  // Sort filtered books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    // Helper function to handle null/undefined values
    const getValueOrZero = (value) => value || 0;

    switch (sortBy) {
      case 'price-low':
        // Sort by price ascending (lowest first)
        // Example: $10 before $20
        return getValueOrZero(a.price) - getValueOrZero(b.price);

      case 'price-high':
        // Sort by price descending (highest first)
        // Example: $20 before $10
        return getValueOrZero(b.price) - getValueOrZero(a.price);

      case 'rating':
        // Sort by rating descending (5 stars first)
        return getValueOrZero(b.rating) - getValueOrZero(a.rating);

      case 'newest':
        // Sort by publish date descending (newest first)
        return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);

      default: // 'popularity'
        // Sort by popularity score (rating × number of reviews)
        const scoreA = getValueOrZero(a.rating) * getValueOrZero(a.reviews?.length);
        const scoreB = getValueOrZero(b.rating) * getValueOrZero(b.reviews?.length);
        return scoreB - scoreA;
    }
  });

  const handleClearFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: 0, max: 100 },
      rating: 0
    });
    setSearchQuery('');
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-gray-900">
            Browse Books
          </h1>
          <p className="mt-2 text-base lg:text-lg text-gray-600">
            Explore our curated selection of books across genres. Use the filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex gap-4 sm:justify-start">
            <button
              onClick={() => setShowFilters(true)}
              className="flex-1 sm:hidden px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category || filters.rating > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="hover:text-primary/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {filters.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {filters.rating}+ Stars
                <button
                  onClick={() => setFilters({ ...filters, rating: 0 })}
                  className="hover:text-primary/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="lg:flex lg:gap-8">
          {/* Mobile Filters Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 sm:hidden ${
              showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setShowFilters(false)}
          />

          {/* Mobile Filters Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 w-[300px] bg-white z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
              showFilters ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
              {/* Filter Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => {
                          setFilters({ ...filters, category: e.target.value });
                          setShowFilters(false);
                        }}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.priceRange.min}
                      onChange={(e) => {
                        setFilters({
                          ...filters,
                          priceRange: {
                            ...filters.priceRange,
                            min: Number(e.target.value)
                          }
                        });
                      }}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>$0</span>
                      <span>${filters.priceRange.max}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Rating</h3>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <label key={stars} className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="rating"
                        value={stars}
                        checked={filters.rating === stars}
                        onChange={(e) => {
                          setFilters({ ...filters, rating: Number(e.target.value) });
                          setShowFilters(false);
                        }}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleClearFilters();
                    setShowFilters(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <FiltersSidebar
              categories={categories}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Books Grid */}
          <div className="flex-1">
            <BooksGrid
              books={sortedBooks}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;