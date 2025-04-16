import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle } from 'lucide-react';
import BookCard from './ui/BookCard';

const BookSection = ({
  title,
  books = [],
  isLoading = false,
  error = null,
  viewAllLink = '/shop'
}) => {
  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold">{title}</h2>
        </div>
        <div className="flex items-center justify-center py-8 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return null; // Don't render anything if there are no books
  }

  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold">{title}</h2>
        <Link
          to={viewAllLink}
          className="text-primary hover:underline flex items-center gap-1 text-sm"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <div key={book.id} className="animate-fade-in">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookSection;