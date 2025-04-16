import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, X, BookOpen } from 'lucide-react';
import BookCard from '../components/ui/BookCard';
import BookSection from '../components/BookSection';
import FeaturedBooks from '../components/FeaturedBooks';
import { useBooks } from '../hooks/useBooks';

const categories = ['Fiction', 'Non-Fiction', 'Science', 'Fantasy', 'Bibliography'];

const Home = () => {
  const { books: allBooks, isLoading, error } = useBooks();
  const [books, setBooks] = useState({ featured: [], newReleases: [], all: [] });

  React.useEffect(() => {
    if (allBooks && allBooks.length > 0) {
      // Randomly shuffle the books array
      const shuffledBooks = [...allBooks].sort(() => Math.random() - 0.5);

      // Get featured books (with high ratings)
      const featured = shuffledBooks
        .slice(0, allBooks.length / 2)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

      // Get new releases (based on published date)
      const releases = shuffledBooks
        .slice(allBooks.length / 2)
        .sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0))
        .slice(0, 6);

      setBooks({
        featured,
        newReleases: releases,
        all: shuffledBooks
      });
    }
  }, [allBooks]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">Error loading books: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66')] bg-cover bg-center opacity-10" />
        <div className="relative flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6 max-w-3xl animate-scale-in">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
              Reading that inspires
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of books across genres and find stories
              that will stay with you long after the last page.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
              <Link to="/shop" className="w-full sm:w-auto bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center">
                Browse Books
              </Link>

              <button
                onClick={() => {
                  document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 text-center"
              >
                View Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-serif font-bold">Featured Books</h2>
          <Link to="/shop" className="text-primary hover:underline flex items-center gap-1 text-sm">
            View All
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <FeaturedBooks
          books={books.featured}
          isLoading={isLoading}
          error={error}
        />
      </section>

      {/* Categories */}
      <section id="categories-section" className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 sm:mb-10 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map(category => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <BookOpen size={24} className="sm:size-8 text-primary mb-2 sm:mb-3" />
                <span className="text-sm sm:text-base font-medium text-center">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Releases */}
      <BookSection
        title="New Releases"
        books={books.newReleases}
        isLoading={isLoading}
        error={error}
      />

      {/* Book Quote Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-gray-800 mb-4">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <p className="text-base sm:text-lg text-gray-600">
            - George R.R. Martin, A Dance with Dragons
          </p>
          <div className="mt-6 sm:mt-8 flex justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;