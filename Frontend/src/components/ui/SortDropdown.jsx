import React from 'react';

const SortDropdown = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-sm min-w-[160px]"
    >
      <option value="popularity">Sort by: Popularity</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="rating">Rating</option>
      <option value="newest">Newest</option>
    </select>
  );
};

export default SortDropdown; 