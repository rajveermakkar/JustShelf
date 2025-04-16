import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../utils/auth';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}`
      );
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      console.log('Order details:', data);
      setOrder(data);
      setNewStatus(data.status);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.message || 'Failed to fetch order');
      navigate('/admin/orders');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.status === 401) {
        // Handle session expiration
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      toast.success('Order status updated successfully');
      fetchOrder(); // Refresh the order details
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.message.includes('session') || error.message.includes('token')) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to update order status');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A74A]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Order not found</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#E6A74A] rounded-md hover:bg-[#d6993a]"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Back to Orders
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Order Information */}
          <div className="lg:w-2/3">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Order Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-base font-medium text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-base font-medium text-gray-900">${order.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span
                      className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Customer Information</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {order.users?.first_name} {order.users?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Email</p>
                  <p className="text-base font-medium text-gray-900">{order.users?.email}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Order Items</h2>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-3 cursor-pointer group"
                      onClick={() => navigate(`/books/${item.id}`)}>
                        <img
                          src={item.image_url || '/placeholder-book.png'}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded rounded group-hover:opacity-90 transition"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-book.png';
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-grey-900 hover:text-primary ">{item.title}</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-xs text-gray-500">Price: ${item.price}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Update Order Status</h2>
                <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : order.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'shipped'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6A74A] focus:border-[#E6A74A] bg-white text-gray-900 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-[#E6A74A] rounded-lg hover:bg-[#d6993a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E6A74A] flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Status</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;