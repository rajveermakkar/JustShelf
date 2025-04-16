import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import BookSection from '../components/BookSection';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../components/NotificationPopup';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const checkCartStatus = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      setIsInCart(cartItems.some(item => item.id === id));
    };

    checkCartStatus();
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Book not found');
        }
        throw new Error('Failed to fetch book details');
      }

      const data = await response.json();
      setBook(data);

      // Fetch similar books based on genre
      if (data.genre) {
        const similarResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/books/genre/${data.genre}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          setSimilarBooks(similarData.filter(b => b.id !== id).slice(0, 4));
        }
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError(err.message || 'Failed to load book details');
      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message={err.message || 'Failed to load book details. Please try again later.'}
          onClose={() => toast.dismiss(t.id)}
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= book.stock_quantity) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < book.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      image_url: book.image_url,
      quantity: quantity,
      stock_quantity: book.stock_quantity
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === book.id);

    if (existingItemIndex !== -1) {
      const newQuantity = existingCart[existingItemIndex].quantity + quantity;
      if (newQuantity <= book.stock_quantity) {
        existingCart[existingItemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(existingCart));
        setIsInCart(true);
        window.dispatchEvent(new Event('cartUpdated'));
        toast.custom((t) => (
          <NotificationPopup
            type="success"
            message={`${book.title} added to cart`}
            onClose={() => toast.dismiss(t.id)}
          />
        ));
      } else {
        toast.custom((t) => (
          <NotificationPopup
            type="error"
            message="Cannot add more than available stock!"
            onClose={() => toast.dismiss(t.id)}
          />
        ));
      }
    } else {
      existingCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      setIsInCart(true);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.custom((t) => (
        <NotificationPopup
          type="success"
          message={`${book.title} added to cart`}
          onClose={() => toast.dismiss(t.id)}
        />
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Book Not Found</h2>
          <p className="text-gray-600">The book you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/shop" className="text-gray-600 hover:text-primary">
            ← Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image */}
          <div className="flex justify-center">
            <div className="w-[300px]">
              <img
                src={book.image_url || '/default-book-cover.jpg'}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-lg object-contain"
                onError={(e) => {
                  e.target.src = '/default-book-cover.jpg';
                  e.target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col justify-start">
            <div>
              <span className="text-sm text-gray-500 mb-1 block">{book.genre || 'Fiction'}</span>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-xl text-gray-600">by {book.author}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">${book.price}</span>
                  <span className="text-sm text-gray-500">ISBN: {book.isbn}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(book.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">({book.reviews || 0} reviews)</span>
              </div>

              {/* Book Details */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="mr-1">📄</span>
                  <span>{book.page_count || 300} pages</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">📅</span>
                  <span>Published {book.published_date ? new Date(book.published_date).getFullYear() : '2024'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">{book.description || 'No description available.'}</p>
              </div>

              {/* Price and Add to Cart */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold">${book.price?.toFixed(2) || '0.00'}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center rounded-md bg-gray-50">
                        <button
                          onClick={decreaseQuantity}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 text-gray-600"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={book.stock_quantity}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-12 text-center bg-transparent border-0 focus:outline-none"
                        />
                        <button
                          onClick={increaseQuantity}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 text-gray-600"
                          disabled={quantity >= book.stock_quantity}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Available: {book.stock_quantity}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart || book.stock_quantity === 0}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    isInCart || book.stock_quantity === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isInCart ? 'Added to Cart' : book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Books Section */}
        {similarBooks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">You might also like</h2>
            <BookSection
              title=""
              books={similarBooks}
              isLoading={loading}
              error={error}
              viewAllLink="/books"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;