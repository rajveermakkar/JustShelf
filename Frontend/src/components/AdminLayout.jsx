import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../utils/auth';
import { FiHome, FiBook, FiUsers, FiShoppingBag, FiMenu, FiSearch, FiBell, FiSettings } from 'react-icons/fi';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    const sidebarItems = [
        { path: '/admin', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/books', icon: FiBook, label: 'Books' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-[#e5e7eb] ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
                <div className="h-20 flex items-center justify-center px-6 border-b border-[#e5e7eb]">
                    {isSidebarOpen ? (
                        <div className="flex items-center justify-between w-full">
                            <h1 className="text-xl font-semibold text-[#111827]">Admin Dashboard</h1>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-[#4B5563] hover:text-[#111827]">
                                <FiMenu className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsSidebarOpen(true)} className="text-[#4B5563] hover:text-[#111827]">
                            <FiMenu className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <nav className="mt-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center py-3 px-6 ${
                                location.pathname === item.path
                                    ? 'text-[#E6A74A] bg-[#FEF7EC]'
                                    : 'text-[#4B5563] hover:bg-gray-50'
                            } transition-colors duration-200 ${!isSidebarOpen && 'justify-center'}`}
                        >
                            <item.icon className={`w-5 h-5 ${
                                location.pathname === item.path ? 'text-[#E6A74A]' : 'text-[#9CA3AF]'
                            }`} />
                            {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}


                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;