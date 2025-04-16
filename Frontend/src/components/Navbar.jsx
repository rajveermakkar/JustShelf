import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ArrowRight, User, LogOut, Package, Settings } from 'lucide-react';
import useAuthStore from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu and user menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Reset user menu state when auth state changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Add useEffect for cart count after the other useEffect hooks
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartItemsCount(itemCount);
    };

    // Update count on mount
    updateCartCount();

    // Listen for storage events to update cart count when cart changes
    window.addEventListener('storage', updateCartCount);

    // Custom event listener for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    // Set a timeout to avoid too many API calls
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching books:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      const newSearches = [searchQuery.trim(), ...recentSearches.filter(s => s !== searchQuery.trim())].slice(0, 3);
      setRecentSearches(newSearches);

      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    const button = document.querySelector('#logout-button');
    button.classList.add('animate-logout');

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    logout();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] bg-white transition-all duration-300 px-4 md:px-8 ${
          isScrolled ? 'py-3 shadow-sm' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex-1">
            {/* Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <Link
                to="/"
                className="font-serif text-2xl font-bold tracking-tight text-black relative z-10"
              >
                JustShelf
              </Link>
            </div>
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-12">
            <Link
              to="/"
              className={`text-sm transition-colors button-hover-effect ${isActive('/') ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground font-medium'}`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-sm transition-colors button-hover-effect ${isActive('/shop') ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground font-medium'}`}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`text-sm transition-colors button-hover-effect ${isActive('/about') ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground font-medium'}`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`text-sm transition-colors button-hover-effect ${isActive('/contact') ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground font-medium'}`}
            >
              Contact Us
            </Link>
          </nav>

          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* Search button - Hide on mobile */}
            <div ref={searchRef} className="relative hidden md:block">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 ease-out">
                  <form onSubmit={handleSearchSubmit} className="p-4">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search for books..."
                        className="w-full px-4 py-2 pr-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-gray-100">
                    {isLoading ? (
                      <div className="py-8 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2 max-h-[300px] overflow-y-auto">
                        {searchResults.map((book) => (
                          <Link
                            key={book.id}
                            to={`/books/${book.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                          >
                            <div className="h-12 w-8 flex-shrink-0">
                              {book.image_url ? (
                                <img
                                  src={book.image_url}
                                  alt={book.title}
                                  className="h-full w-full object-cover rounded"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{book.title}</span>
                              <span className="text-xs text-gray-500">{book.author}</span>
                              <span className="text-xs text-primary font-medium">${book.price}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : searchQuery.length > 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No results found
                      </div>
                    ) : recentSearches.length > 0 ? (
                      <div className="p-4">
                        <h3 className="text-xs font-medium text-gray-500 mb-2">Recent Searches</h3>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(search);
                                inputRef.current?.focus();
                              }}
                              className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-primary text-white rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {user?.first_name}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            <span>My Orders</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            id="logout-button"
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`fixed inset-0 z-[55] md:hidden ${
            isMobileMenuOpen ? '' : 'pointer-events-none'
          }`}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu */}
          <div
            className={`absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-serif text-xl font-bold">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Search Bar */}
              <div className="p-4 border-b border-gray-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search for books..."
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </form>

                {/* Mobile Search Results */}
                {(searchResults.length > 0 || (searchQuery.length > 0 && !isLoading)) && (
                  <div className="mt-2 bg-white rounded-lg border border-gray-100 overflow-hidden">
                    {isLoading ? (
                      <div className="py-4 text-center">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[300px] overflow-y-auto">
                        {searchResults.map((book) => (
                          <Link
                            key={book.id}
                            to={`/books/${book.id}`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="h-12 w-8 flex-shrink-0">
                              {book.image_url ? (
                                <img
                                  src={book.image_url}
                                  alt={book.title}
                                  className="h-full w-full object-cover rounded"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{book.title}</span>
                              <span className="text-xs text-gray-500">{book.author}</span>
                              <span className="text-xs text-primary font-medium">${book.price}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base ${
                    isActive('/') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base ${
                    isActive('/shop') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Shop
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base ${
                    isActive('/about') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base ${
                    isActive('/contact') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Contact Us
                </Link>
              </nav>

              {isAuthenticated ? (
                <div className="border-t border-gray-100 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Package className="h-4 w-4 mr-3" />
                      Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        const button = document.querySelector('#mobile-logout-button');
                        button.classList.add('animate-logout');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await logout();
                        setIsMobileMenuOpen(false);
                      }}
                      id="mobile-logout-button"
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 p-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under the fixed header */}
      <div className="h-[72px]" />
    </>
  );
};

export default Navbar;
