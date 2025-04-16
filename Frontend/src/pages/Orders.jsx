import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { Package, Clock, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../components/NotificationPopup';

const formatAddress = (address) => {
  if (!address) return '';
  return `${address.address_line1}, ${address.city}, ${address.state} ${address.postal_code}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, fetchWithAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        if (!data.orders) {
          throw new Error('Invalid response format');
        }
        setOrders(data.orders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        if (err.message.includes('Session expired')) {
          toast.custom((t) => (
            <NotificationPopup
              type="error"
              message="Your session has expired. Please log in again."
              onClose={() => toast.dismiss(t.id)}
            />
          ));
          navigate('/login');
        } else {
          toast.custom((t) => (
            <NotificationPopup
              type="error"
              message={err.message || 'Failed to fetch orders'}
              onClose={() => toast.dismiss(t.id)}
            />
          ));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, fetchWithAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <div className="space-y-4 max-w-sm mx-auto">
            <Link
              to="/shop"
              className="block w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors text-center"
            >
              Start Shopping
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(-6)}</h3>
                  <p className="text-gray-500 mt-1">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <Link to={`/books/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.image_url || '/placeholder-book.png'}
                          alt={item.title}
                          className="w-16 h-24 object-cover rounded hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-book.png';
                          }}
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/books/${item.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Shipping Address</h5>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatAddress(order.shippingAddress)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Payment Method</h5>
                      <p className="text-sm text-gray-500 mt-1 capitalize">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;