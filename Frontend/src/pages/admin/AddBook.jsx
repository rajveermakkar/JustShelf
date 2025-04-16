import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../utils/auth';
import NotificationPopup from '../../components/NotificationPopup';
import { FiArrowLeft, FiSave, FiImage, FiBook, FiUser, FiDollarSign, FiPackage, FiTag, FiStar, FiMessageSquare } from 'react-icons/fi';

const AddBook = () => {
  const navigate = useNavigate();
  const { fetchWithAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: '',
    isbn: '',
    page_count: '',
    rating: '0',
    reviews: '0'
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If image URL is being set, clear the file upload
    if (name === 'image_url' && value) {
      setImageFile(null);
      setPreviewUrl(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear the image URL when a file is selected
      setFormData(prev => ({
        ...prev,
        image_url: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, if there's an image file, upload it to Supabase
      let imageUrl = formData.image_url;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResponse = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/admin/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${useAuthStore.getState().getToken()}`
            },
            body: formData
          }
        );

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 401) {
            toast.custom((t) => (
              <NotificationPopup
                type="error"
                message="Your session has expired. Please log in again."
                onClose={() => {
                  toast.dismiss(t.id);
                  logout();
                  navigate('/login');
                }}
              />
            ));
            return;
          }
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      // Then create the book with all data including the image URL
      const bookData = {
        ...formData,
        image_url: imageUrl,
        stock_quantity: formData.stock_quantity === '' ? '0' : formData.stock_quantity
      };

      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/books`,
        {
          method: 'POST',
          body: JSON.stringify(bookData)
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.custom((t) => (
            <NotificationPopup
              type="error"
              message="Your session has expired. Please log in again."
              onClose={() => {
                toast.dismiss(t.id);
                logout();
                navigate('/login');
              }}
            />
          ));
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create book');
      }

      toast.custom((t) => (
        <NotificationPopup
          type="success"
          message="Book created successfully!"
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      navigate('/admin/books');
    } catch (error) {
      console.error('Error creating book:', error);
      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message={error.message || 'Failed to create book'}
          onClose={() => toast.dismiss(t.id)}
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/books')}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Book</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiBook className="w-5 h-5 mr-2 text-gray-500" />
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                      placeholder="Enter book title"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiUser className="w-5 h-5 mr-2 text-gray-500" />
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Enter book description"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                        <FiDollarSign className="w-5 h-5 mr-2 text-gray-500" />
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                        <FiPackage className="w-5 h-5 mr-2 text-gray-500" />
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiTag className="w-5 h-5 mr-2 text-gray-500" />
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                      placeholder="Enter book category"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="Enter image URL or upload an image below"
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Upload Image</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <FiImage className="w-5 h-5 mr-2" />
                        {imageFile ? 'Change Image' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {previewUrl && (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                          {imageFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setPreviewUrl('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiBook className="w-5 h-5 mr-2 text-gray-500" />
                      ISBN
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Enter ISBN"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiBook className="w-5 h-5 mr-2 text-gray-500" />
                      Page Count
                    </label>
                    <input
                      type="number"
                      name="page_count"
                      value={formData.page_count}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Enter page count"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiStar className="w-5 h-5 mr-2 text-gray-500" />
                      Rating
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Enter rating (0-5)"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1 flex items-center">
                      <FiMessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                      Reviews Count
                    </label>
                    <input
                      type="number"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-base rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Enter number of reviews"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/books')}
                  className="px-5 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 text-base font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  <FiSave className="w-5 h-5 mr-2" />
                  {loading ? 'Creating...' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook; 