const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard statistics...');

        // Get total books and low stock books
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('*');

        if (booksError) {
            console.error('Error fetching books:', booksError);
            throw booksError;
        }

        console.log('Books fetched:', books.length);

        const totalBooks = books.length;
        const lowStockBooks = books.filter(book => book.stock_quantity <= 5).length;
        const booksByCategory = books.reduce((acc, book) => {
            const category = book.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // Get total users and users by role
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) {
            console.error('Error fetching users:', usersError);
            throw usersError;
        }

        console.log('Users fetched:', users.length);

        const totalUsers = users.length;
        const usersByRole = users.reduce((acc, user) => {
            const role = user.role || 'user';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        // Get order statistics
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*');

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            throw ordersError;
        }

        console.log('Orders fetched:', orders.length);

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + (order.total_amount || 0);
        }, 0);

        const ordersByStatus = orders.reduce((acc, order) => {
            const status = order.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Get daily revenue for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenue = orders.reduce((acc, order) => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            if (new Date(date) >= sevenDaysAgo) {
                acc[date] = (acc[date] || 0) + (order.total_amount || 0);
            }
            return acc;
        }, {});

        // Get top selling books
        const topSellingBooks = orders.reduce((acc, order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            items.forEach(item => {
                const book = books.find(b => b.id === item.id);
                if (book) {
                    const existing = acc.find(b => b.id === book.id);
                    if (existing) {
                        existing.totalSales += item.quantity;
                    } else {
                        acc.push({
                            id: book.id,
                            title: book.title,
                            totalSales: item.quantity,
                            stock_quantity: book.stock_quantity
                        });
                    }
                }
            });
            return acc;
        }, []).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

        console.log('Dashboard stats calculated:', {
            totalBooks,
            lowStockBooks,
            booksByCategory,
            totalUsers,
            usersByRole,
            totalOrders,
            totalRevenue,
            ordersByStatus,
            dailyRevenue,
            topSellingBooks: topSellingBooks.length
        });

        res.json({
            inventoryStatus: {
                totalBooks,
                lowStockBooks,
                booksByCategory
            },
            userActivity: {
                totalUsers,
                usersByRole
            },
            salesReports: {
                totalOrders,
                totalRevenue,
                ordersByStatus,
                dailyRevenue
            },
            revenueAnalytics: {
                topSellingBooks
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

module.exports = getDashboardStats;
