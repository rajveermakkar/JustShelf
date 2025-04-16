import React from 'react';

const Confirmation = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg text-left">
            <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Order Number</span>
                <span className="font-medium">#12345</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium">Today</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation; 