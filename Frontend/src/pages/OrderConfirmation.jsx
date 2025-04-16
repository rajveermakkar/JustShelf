import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-8">
            Your order has been successfully placed. We'll send you an email confirmation with your order details.
          </p>
          <div className="space-y-4">
            <Link
              to="/orders"
              className="block w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              View Order Status
            </Link>
            <Link
              to="/shop"
              className="block w-full bg-gray-100 text-gray-800 py-3 rounded-md hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 