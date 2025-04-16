import { useState, useEffect } from 'react';
import useAuthStore from '../utils/auth';

export const useBooks = (searchQuery = '') => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = searchQuery
          ? `${import.meta.env.VITE_API_URL}/api/books/search?q=${encodeURIComponent(searchQuery)}`
          : `${import.meta.env.VITE_API_URL}/api/books`;

        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, token]);

  return { books, isLoading, error };
};