import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../utils/auth';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [cartItems, setCartItems] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveInformation: false
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(items);

    const loadUserData = async () => {
      if (user && token) {
        try {
          // Get user profile data
          const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!profileResponse.ok) throw new Error('Failed to load profile');
          const profileData = await profileResponse.json();

          // Only update form data if the fields are not empty
          setFormData(prev => ({
            ...prev,
            firstName: profileData.first_name || prev.firstName,
            lastName: profileData.last_name || prev.lastName,
            email: user.email || prev.email,
            phone: profileData.phone || profileData.phone_number || prev.phone
          }));

          // Get saved addresses
          const addressResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!addressResponse.ok) throw new Error('Failed to load addresses');
          const addresses = await addressResponse.json();

          setSavedAddresses(addresses || []);
          if (addresses?.length > 0) {
            const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
            setSelectedAddress(defaultAddress);
            setFormData(prev => ({
              ...prev,
              address: defaultAddress.address_line1 || prev.address,
              city: defaultAddress.city || prev.city,
              state: defaultAddress.state || prev.state,
              zipCode: defaultAddress.postal_code || prev.zipCode
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          toast.error('Failed to load your information');
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [user, token, navigate]);

  const validateCardNumber = (number) => {
    // Remove spaces and non-numeric characters
    const cleaned = number.replace(/\D/g, '');
    // Check if it's a valid length (13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    // Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateExpiryDate = (date) => {
    const [month, year] = date.split('/');
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow numbers and common phone number characters
      const phonePattern = /^[0-9-+() ]*$/;
      if (!phonePattern.test(value)) {
        return;
      }
    }

    if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 4) return;
      const formatted = cleaned.replace(/(\d{2})(\d{0,2})/, '$1/$2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'cvv') {
      // Only allow 3-4 digits
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 4) return;
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Phone number is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.address || !formData.address.trim()) {
      toast.error('Address is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.city || !formData.city.trim()) {
      toast.error('City is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.state || !formData.state.trim()) {
      toast.error('State is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.zipCode || !formData.zipCode.trim()) {
      toast.error('ZIP Code is required');
      setIsSubmitting(false);
      return;
    }

    // Validate credit card if payment method is card
    if (paymentMethod === 'card') {
      if (!validateCardNumber(formData.cardNumber)) {
        toast.error('Invalid card number');
        setIsSubmitting(false);
        return;
      }

      if (!validateExpiryDate(formData.expiryDate)) {
        toast.error('Invalid expiry date');
        setIsSubmitting(false);
        return;
      }

      if (!validateCVV(formData.cvv)) {
        toast.error('Invalid CVV');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Save address if requested and not already saved
      if (formData.saveInformation) {
        const existingAddress = savedAddresses.find(addr => 
          addr.address_line1 === formData.address &&
          addr.city === formData.city &&
          addr.state === formData.state &&
          addr.postal_code === formData.zipCode
        );

        if (!existingAddress) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/users/addresses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              address_line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              is_default: true
            })
          });

          if (!response.ok) {
            console.error('Failed to save address:', await response.json());
            // Continue with order placement even if address save fails
          }
        }
      }

      // Create order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          shipping_address: {
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode
          },
          payment_method: paymentMethod,
          total_amount: calculateTotal()
        })
      });

      const responseData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(responseData.error || 'Failed to place order');
      }
      
      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message
      toast.success(responseData.message || 'Order placed successfully!');
      
      // Redirect to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          
          {savedAddresses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Saved Addresses</h3>
              <div className="space-y-3">
                {savedAddresses.map(address => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedAddress?.id === address.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedAddress(address);
                      setFormData(prev => ({
                        ...prev,
                        address: address.address_line1,
                        city: address.city,
                        state: address.state,
                        zipCode: address.postal_code
                      }));
                    }}
                  >
                    <p className="font-medium">{address.address_line1}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="saveInformation"
                checked={formData.saveInformation}
                onChange={(e) => setFormData(prev => ({ ...prev, saveInformation: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Save this information for next time
              </label>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t my-4"></div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span>Credit Card</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    placeholder="MM/YY"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 