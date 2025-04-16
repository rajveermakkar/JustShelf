import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../components/NotificationPopup';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    // Add entrance animation
    const timer = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.custom((t) => (
          <NotificationPopup
            type="success"
            message="Login successful! Redirecting..."
            onClose={() => toast.dismiss(t.id)}
          />
        ));
        navigate('/');
      } else {
        const errorMessage = result.error?.message || result.error || 'Invalid email or password';
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-fit sm:min-h-[calc(100vh-64px)] pt-12 sm:flex sm:items-center">
      <div className={`max-w-md mx-auto px-6 ${showForm ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <div className="text-center">
          <div className="flex justify-center">
            <FiLogIn className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Welcome back! Please enter your details
          </p>
        </div>

        {error && (
          <NotificationPopup
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form className="mt-8 space-y-5 mb-8 sm:mb-0" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
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
                required
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors text-sm font-medium mt-6"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;