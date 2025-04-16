import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../utils/auth';
import { toast } from 'react-hot-toast';
import NotificationPopup from '../../components/NotificationPopup';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, fetchWithAuth } = useAuthStore();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: {},
    lowStockBooks: 0,
    salesTrend: { labels: [], data: [] },
    topSellingBooks: [],
    booksByCategory: {},
    usersByRole: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        
        setStats({
          totalBooks: data?.inventoryStatus?.totalBooks || 0,
          totalOrders: data?.salesReports?.totalOrders || 0,
          totalUsers: data?.userActivity?.totalUsers || 0,
          totalRevenue: data?.salesReports?.totalRevenue || 0,
          recentOrders: data?.salesReports?.ordersByStatus || {},
          lowStockBooks: data?.inventoryStatus?.lowStockBooks || 0,
          salesTrend: {
            labels: Object.keys(data?.salesReports?.dailyRevenue || {}),
            data: Object.values(data?.salesReports?.dailyRevenue || {})
          },
          topSellingBooks: data?.revenueAnalytics?.topSellingBooks || [],
          booksByCategory: data?.inventoryStatus?.booksByCategory || {},
          usersByRole: data?.userActivity?.usersByRole || {}
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        toast.custom((t) => (
          <NotificationPopup
            type="error"
            message={error.message || "Failed to load dashboard data"}
            onClose={() => toast.dismiss(t.id)}
          />
        ));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate, fetchWithAuth]);

  const revenueChartData = {
    labels: stats.salesTrend.labels,
    datasets: [
      {
        label: 'Daily Revenue',
        data: stats.salesTrend.data,
        fill: true,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4
      }
    ]
  };

  const categoryChartData = {
    labels: Object.keys(stats.booksByCategory),
    datasets: [
      {
        data: Object.values(stats.booksByCategory),
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899'
        ]
      }
    ]
  };

  const orderStatusChartData = {
    labels: Object.keys(stats.recentOrders),
    datasets: [
      {
        data: Object.values(stats.recentOrders),
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#4F46E5'
        ]
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Welcome back, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Books</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalBooks}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalOrders}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Users</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Revenue Trend */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-60 sm:h-80">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Books by Category */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Books by Category</h3>
            <div className="h-60 sm:h-80">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 640 ? 'bottom' : 'right'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
            <div className="h-60 sm:h-80">
              <Bar
                data={orderStatusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top Selling Books */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Top Selling Books</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topSellingBooks.map((book, index) => (
                    <tr key={index}>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 truncate max-w-[200px]">{book.title}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{book.totalSales}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{book.stock_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;