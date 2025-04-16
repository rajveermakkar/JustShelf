const { supabase } = require('../../utils/supabaseClient');

const getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // 1. Sales Reports
        const { data: salesData, error: salesError } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', startDate || '2024-01-01')
            .lte('created_at', endDate || new Date().toISOString());

        if (salesError) throw salesError;

        // Calculate sales metrics
        const salesMetrics = {
            totalRevenue: salesData.reduce((sum, order) => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                return sum + items.reduce((orderSum, item) => {
                    return orderSum + (item.price * item.quantity);
                }, 0);
            }, 0),
            totalOrders: salesData.length,
            averageOrderValue: 0,
            ordersByStatus: {},
            dailyRevenue: {}
        };

        // Calculate orders by status and daily revenue
        salesData.forEach(order => {
            // Orders by status
            salesMetrics.ordersByStatus[order.status] = (salesMetrics.ordersByStatus[order.status] || 0) + 1;

            // Daily revenue
            const date = order.created_at.split('T')[0];
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            salesMetrics.dailyRevenue[date] = (salesMetrics.dailyRevenue[date] || 0) + orderTotal;
        });

        // Calculate average order value
        salesMetrics.averageOrderValue = salesMetrics.totalOrders > 0
            ? salesMetrics.totalRevenue / salesMetrics.totalOrders
            : 0;

        // 2. User Activity
        const { data: userActivity, error: userError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (userError) throw userError;

        const userMetrics = {
            totalUsers: userActivity.length,
            newUsers: userActivity.filter(user => {
                const userDate = new Date(user.created_at);
                const start = new Date(startDate || '2024-01-01');
                const end = new Date(endDate || new Date().toISOString());
                return userDate >= start && userDate <= end;
            }).length,
            activeUsers: 0, // We'll calculate this below
            usersByRole: {}
        };

        // Get unique user IDs from orders
        const { data: userOrders, error: userOrdersError } = await supabase
            .from('orders')
            .select('user_id');

        if (!userOrdersError) {
            const activeUserIds = new Set(userOrders.map(order => order.user_id));
            userMetrics.activeUsers = activeUserIds.size;
        }

        // Calculate users by role
        userActivity.forEach(user => {
            const role = user.role || 'user';
            userMetrics.usersByRole[role] = (userMetrics.usersByRole[role] || 0) + 1;
        });

        // 3. Inventory Status
        const { data: inventoryData, error: inventoryError } = await supabase
            .from('books')
            .select('*')
            .order('stock_quantity', { ascending: true });

        if (inventoryError) throw inventoryError;

        const inventoryMetrics = {
            totalBooks: inventoryData.length,
            lowStockBooks: inventoryData.filter(book => book.stock_quantity < 10).length,
            outOfStockBooks: inventoryData.filter(book => book.stock_quantity === 0).length,
            totalStockValue: inventoryData.reduce((sum, book) => sum + (book.price * book.stock_quantity), 0),
            booksByCategory: inventoryData.reduce((acc, book) => {
                acc[book.category] = (acc[book.category] || 0) + 1;
                return acc;
            }, {})
        };

        // 4. Revenue Analytics
        const revenueAnalytics = {
            monthlyRevenue: {},
            topSellingBooks: [],
            revenueByCategory: {}
        };

        // Calculate monthly revenue and top selling books
        const bookSales = {};
        salesData.forEach(order => {
            const month = order.created_at.substring(0, 7); // YYYY-MM
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

            // Monthly revenue
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            revenueAnalytics.monthlyRevenue[month] = (revenueAnalytics.monthlyRevenue[month] || 0) + orderTotal;

            // Book sales
            items.forEach(item => {
                bookSales[item.id] = (bookSales[item.id] || 0) + item.quantity;
            });
        });

        // Get top 5 selling books
        const topSellingBookIds = Object.entries(bookSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id]) => id);

        const { data: topBooks, error: topBooksError } = await supabase
            .from('books')
            .select('*')
            .in('id', topSellingBookIds);

        if (!topBooksError) {
            revenueAnalytics.topSellingBooks = topBooks.map(book => ({
                ...book,
                totalSales: bookSales[book.id]
            }));
        }

        // Calculate revenue by category
        salesData.forEach(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            items.forEach(item => {
                const category = item.category;
                const revenue = item.price * item.quantity;
                revenueAnalytics.revenueByCategory[category] =
                    (revenueAnalytics.revenueByCategory[category] || 0) + revenue;
            });
        });

        res.json({
            salesReports: salesMetrics,
            userActivity: userMetrics,
            inventoryStatus: inventoryMetrics,
            revenueAnalytics
        });
    } catch (error) {
        console.error('Dashboard statistics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

module.exports = getDashboardStats;