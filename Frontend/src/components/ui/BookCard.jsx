import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => (
  <Link to={`/books/${book.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <img
      src={book.image_url || 'https://via.placeholder.com/300x450?text=No+Image'}
      alt={book.title}
      className="w-full aspect-[3/4] object-cover rounded-t-lg"
      onError={(e) => {
        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
      }}
    />
    <div className="p-4">
      <h3 className="font-medium mb-1 line-clamp-1">{book.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{book.author}</p>
      <p className="font-bold">${book.price?.toFixed(2)}</p>
    </div>
  </Link>
);

export default BookCard; 