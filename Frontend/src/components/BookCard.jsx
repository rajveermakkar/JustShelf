import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <Link
      to={`/books/${book.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[2/3]">
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600 mb-2">By {book.author}</p>
        <p className="font-bold text-lg">${book.price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default BookCard; 