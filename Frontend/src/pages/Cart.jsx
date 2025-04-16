import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import BookSection from '../components/BookSection';
import useAuthStore from '../utils/auth';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);

    // Fetch recommended books
    const fetchRecommendedBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommended books');
        }
        const data = await response.json();
        // Shuffle and get 6 random books
        const shuffledBooks = [...data].sort(() => Math.random() - 0.5);
        setRecommendedBooks(shuffledBooks.slice(0, 6));
      } catch (error) {
        console.error('Error fetching recommended books:', error);
        setError('Failed to load recommended books. Please try again later.');
        toast.error('Failed to load recommended books. Please try again later.');
        setRecommendedBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedBooks();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    // Dispatch cartUpdated event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Save return URL
      localStorage.setItem('returnUrl', '/checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              to="/shop"
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Recommended Books */}
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">Recommended for You</h2>
            <BookSection books={recommendedBooks} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-8">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200 last:border-0">
              <Link to={`/books/${item.id}`} className="shrink-0 mx-auto sm:mx-0">
                <img
                  src={item.image_url || 'https://via.placeholder.com/80x120?text=No+Image'}
                  alt={item.title}
                  className="w-24 h-36 sm:w-20 sm:h-30 object-cover rounded-md"
                />
              </Link>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <Link to={`/books/${item.id}`} className="font-medium hover:text-primary">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-600">by {item.author}</p>
                    <p className="text-sm text-gray-600">Paperback</p>
                    <p className="text-green-600 text-sm mt-1">AVAILABLE</p>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <div className="flex items-center gap-4">
                      <div className="text-center sm:text-right">
                        <p className="line-through text-gray-500 text-sm">${item.price.toFixed(2)}</p>
                        <p className="font-bold">${(item.price * 0.9).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              const newItems = cartItems.map(cartItem =>
                                cartItem.id === item.id
                                  ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                  : cartItem
                              );
                              setCartItems(newItems);
                              localStorage.setItem('cart', JSON.stringify(newItems));
                              window.dispatchEvent(new Event('cartUpdated'));
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.stock_quantity) {
                              const newItems = cartItems.map(cartItem =>
                                cartItem.id === item.id
                                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                  : cartItem
                              );
                              setCartItems(newItems);
                              localStorage.setItem('cart', JSON.stringify(newItems));
                              window.dispatchEvent(new Event('cartUpdated'));
                            } else {
                              toast.error(`Cannot add more than ${item.stock_quantity} items`);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.stock_quantity} available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Order Summary */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-600 text-center sm:text-left">
                You'll raise ${(calculateTotal() * 0.1).toFixed(2)} for local bookstores!
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-lg font-bold mb-2 sm:mb-0">
                Total: ${(calculateTotal() * 0.9).toFixed(2)}
              </p>
              <button
                onClick={handleCheckout}
                className="w-full sm:w-auto bg-primary text-white px-8 py-2.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Books */}
        <div className="mt-8">
          <BookSection
            title="Recommended Books"
            books={recommendedBooks}
            isLoading={isLoading}
            error={error}
            viewAllLink="/shop"
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;