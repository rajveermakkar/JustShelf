import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../components/NotificationPopup';
import { FiLock, FiUser, FiMail, FiUserPlus } from 'react-icons/fi';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message="All fields are required"
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      setIsLoading(false);
      return;
    }

    // Email format validation
    if (!validateEmail(formData.email)) {
      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message="Please enter a valid email address"
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      setIsLoading(false);
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message="Passwords do not match"
          onClose={() => toast.dismiss(t.id)}
        />
      ));
      setIsLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const checkUserResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (checkUserResponse.ok) {
        const { exists } = await checkUserResponse.json();
        if (exists) {
          toast.custom((t) => (
            <NotificationPopup
              type="error"
              message="An account with this email already exists"
              onClose={() => toast.dismiss(t.id)}
            />
          ));
          setIsLoading(false);
          return;
        }
      }

      const result = await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (result.success) {
        toast.custom((t) => (
          <NotificationPopup
            type="success"
            message={result.message}
            onClose={() => toast.dismiss(t.id)}
          />
        ));
        navigate('/login');
      } else {
        throw new Error(result.error?.message || 'User already registered');
      }
    } catch (err) {
      const errorMessage = err.message === 'User already registered' ||
                         (err.error?.message === 'User already registered') ?
                         'An account with this email already exists' :
                         err.message || 'Failed to create user account';

      toast.custom((t) => (
        <NotificationPopup
          type="error"
          message={errorMessage}
          onClose={() => toast.dismiss(t.id)}
        />
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-fit sm:min-h-[calc(100vh-64px)] pt-12 sm:flex sm:items-center">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center">
          <div className="flex justify-center">
            <FiUserPlus className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Join our community of book lovers
          </p>
        </div>

        <form className="mt-8 space-y-5 mb-8 sm:mb-0" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="flex gap-5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="First Name"
                  disabled={isLoading}
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Last Name"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Confirm Password"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors text-sm font-medium mt-6"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;