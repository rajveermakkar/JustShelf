import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import useAuthStore from '../../utils/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ViewDetails from '../../components/ViewDetails';
import AdminTable from '../../components/AdminTable';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const navigate = useNavigate();

  const columns = [
    { key: 'main', label: 'Book', width: 'w-[300px]' },
    { key: 'author', label: 'Author', width: 'w-[200px]' },
    { key: 'category', label: 'Category', width: 'w-[150px]' },
    {
      key: 'price',
      label: 'Price',
      width: 'w-[100px]',
      format: (value) => `$${value}`
    },
    { key: 'stock_quantity', label: 'Stock', width: 'w-[100px]' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchBooks();
  }, [isAuthenticated, user]);

  const fetchBooks = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    const book = books.find(b => b.id === bookId);
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/books/${bookToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete book');
      }

      toast.success('Book deleted successfully');
      // Update the books list by removing the deleted book
      setBooks(books.filter(book => book.id !== bookToDelete.id));
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(error.message || 'Failed to delete book');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleEdit = (book) => {
    navigate(`/admin/books/${book.id}/edit`, { state: { book } });
  };

  const handleView = (book) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A74A]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
        <button
          onClick={() => navigate('/admin/books/add')}
          className="bg-[#E6A74A] text-white px-4 py-2 rounded-lg hover:bg-[#d6993a] transition-colors flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Book</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6A74A] focus:border-transparent"
          />
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={filteredBooks}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        imageKey="image_url"
        titleKey="title"
        subtitleKey="isbn"
        subtitlePrefix="ISBN: "
        detailsPath="/books"
      />

      <ViewDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedBook}
        type="book"
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${bookToDelete?.title || ''}"?`}
        itemName={bookToDelete?.title || null}
      />
    </div>
  );
};

export default Books;