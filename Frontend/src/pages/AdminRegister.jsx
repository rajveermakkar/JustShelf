import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../components/NotificationPopup';
import { FiLock, FiUser, FiMail, FiKey, FiShield } from 'react-icons/fi';

const AdminRegister = () => {
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
            const result = await signup(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                'admin' // Set role to admin
            );

            if (result.success) {
                toast.custom((t) => (
                    <NotificationPopup
                        type="success"
                        message={result.message}
                        onClose={() => toast.dismiss(t.id)}
                    />
                ));
                navigate('/admin');
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            toast.custom((t) => (
                <NotificationPopup
                    type="error"
                    message={err.message}
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
                        <FiShield className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                    </div>
                    <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">
                        Admin Registration
                    </h2>
                    <p className="mt-3 text-sm text-gray-600">
                        Create your admin account to access the dashboard
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
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
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
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
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
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
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
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiKey className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors text-sm font-medium mt-6"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Admin Account'
                        )}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200">
                            Sign in to admin dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;