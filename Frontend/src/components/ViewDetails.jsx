import React, { useState } from 'react';
import { FiX, FiMapPin, FiCreditCard, FiPackage, FiCalendar, FiBook, FiDollarSign, FiTag, FiHash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { toast } from 'react-hot-toast';

const ViewDetails = ({ isOpen, onClose, data, type, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const { fetchWithAuth } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen || !data) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...data });
  };

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${data.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            first_name: editedData.first_name,
            last_name: editedData.last_name,
            role: editedData.role
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      onUpdate(updatedUser.user);
      setIsEditing(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleRoleChange = (e) => {
    setEditedData({
      ...editedData,
      role: e.target.value
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const renderUserDetails = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-[#E6A74A] hover:text-[#d6993a] text-sm font-medium"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="bg-[#E6A74A] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#d6993a]"
              >
                Save
              </button>
          <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
                Cancel
          </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedData.first_name}
                  onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  value={editedData.last_name}
                  onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ) : (
              <p className="text-gray-900">{data.first_name} {data.last_name}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900">{data.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-gray-900">{data.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            {isEditing ? (
              <select
                value={editedData.role}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{data.role}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-gray-900">{new Date(data.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-gray-900">{new Date(data.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
        {data.addresses && data.addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <p className="font-medium">{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state} {address.postal_code}</p>
                  <p>{address.country}</p>
                  <p className="text-sm text-gray-500">
                    {address.is_default ? 'Default Address' : 'Additional Address'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No addresses found</p>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
        {data.orders && data.orders.length > 0 ? (
          <div className="space-y-4">
            {data.orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Items</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-24 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x96?text=No+Image';
                            }}
                          />
                    <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity}x ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No orders found</p>
        )}
      </div>
    </div>
  );

  const renderBookDetails = () => (
    <div className="space-y-6">
      {/* Book Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <img
              src={data.image_url || '/placeholder-book.png'}
              alt={data.title}
              className="w-32 h-48 object-cover rounded-lg shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-book.png';
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{data.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="text-gray-900">{data.author}</p>
                    </div>
                    <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-900">{data.category}</p>
                    </div>
                    <div>
                <p className="text-sm text-gray-500">ISBN</p>
                <p className="text-gray-900">{data.isbn}</p>
                    </div>
                    <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-gray-900">${data.price}</p>
                    </div>
                    <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p className="text-gray-900">{data.stock_quantity} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-sm font-medium ${data.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Description */}
      {data.description && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{data.description}</p>
            </div>
          )}

      {/* Additional Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-gray-900">{new Date(data.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-gray-900">{new Date(data.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderDetails = () => (
                <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-gray-900">#{data.id}</p>
                    </div>
                    <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="text-gray-900">{new Date(data.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        data.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        data.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        data.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        data.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                    <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-gray-900">${data.total}</p>
                    </div>
                  </div>
                </div>

      {/* Customer Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-gray-900">{data.user?.firstName} {data.user?.lastName}</p>
                    </div>
                    <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900">{data.user?.email}</p>
                    </div>
                  </div>
                </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
          {data.items?.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className="flex-shrink-0">
                <img
                  src={item.book?.image_url || '/placeholder-book.png'}
                  alt={item.book?.title}
                  className="w-20 h-28 object-cover rounded shadow"
                          onError={(e) => {
                    e.target.onerror = null;
                            e.target.src = '/placeholder-book.png';
                          }}
                        />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{item.book?.title}</h4>
                <p className="text-sm text-gray-600">by {item.book?.author}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Quantity: {item.quantity}
            </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${item.price} per unit
                  </div>
                </div>
                <div className="mt-1 text-right text-sm font-medium text-gray-900">
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </div>
                        </div>
                      </div>
                    ))}
                  </div>
        <div className="mt-6 text-right">
          <p className="text-lg font-semibold text-gray-900">
            Total: ${data.total}
          </p>
        </div>
              </div>
            </div>
  );

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="mt-20 bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">
            {type === 'user' ? 'User Details' : type === 'order' ? 'Order Details' : 'Book Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {type === 'user' && renderUserDetails()}
          {type === 'book' && renderBookDetails()}
          {type === 'order' && renderOrderDetails()}
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;