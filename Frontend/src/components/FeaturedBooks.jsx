import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import BookCard from './ui/BookCard';

const FeaturedBooks = ({ books, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[400px] rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {books.map(book => (
        <div key={book.id} className="animate-slide-in">
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
};

export default FeaturedBooks; 