import React from 'react';
import { Star, X } from 'lucide-react';

const FiltersSidebar = ({ filters, onFilterChange, onClearFilters, categories = [] }) => {
  return (
    <div className="w-60 shrink-0">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-sm">Filters</h3>
          <button
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <>
            <h3 className="font-semibold mb-3 text-sm">Categories</h3>
            <div className="space-y-2 text-sm">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                    className="text-primary focus:ring-primary"
                  />
                  {category}
                </label>
              ))}
            </div>
            <hr className="my-6" />
          </>
        )}

        {/* Price Range */}
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.priceRange.max}
            onChange={(e) => onFilterChange({
              ...filters,
              priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
            })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>${filters.priceRange.min}</span>
            <span>${filters.priceRange.max}</span>
          </div>
        </div>

        <hr className="my-6" />

        {/* Rating */}
        <h3 className="font-semibold mb-3 text-sm">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => onFilterChange({ ...filters, rating: parseInt(e.target.value) })}
                className="text-primary focus:ring-primary"
              />
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star key={i + rating} className="h-3.5 w-3.5 text-gray-300" />
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar; 