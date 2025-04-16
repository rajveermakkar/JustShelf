import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEye } from 'react-icons/fi';
import useAuthStore from '../../utils/auth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      toast.success('Order deleted successfully');
      // Update the orders list by removing the deleted order
      setOrders(orders.filter(order => order.id !== orderToDelete.id));
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'Failed to delete order');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleView = (order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A74A]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No orders found</h2>
          <p className="mt-2 text-gray-600">There are currently no orders in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.user?.firstName} {order.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">${order.total}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleView(order)}
                      className="text-[#E6A74A] hover:text-[#d6993a] cursor-pointer"
                    >
                      <FiEye size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(order.id);
                      }}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order #${orderToDelete?.id || ''}?`}
        itemName={orderToDelete ? `Order #${orderToDelete.id}` : null}
      />
    </div>
  );
};

export default Orders;