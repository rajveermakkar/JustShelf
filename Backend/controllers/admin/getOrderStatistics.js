const { supabase } = require('../../utils/supabaseClient');

const getOrderStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = supabase
            .from('orders')
            .select('*');

        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: orders, error } = await query;

        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Failed to fetch order statistics' });
        }

        // Calculate statistics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            return sum + items.reduce((orderSum, item) => {
                return orderSum + (item.price * item.quantity);
            }, 0);
        }, 0);

        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        const dailyStats = orders.reduce((acc, order) => {
            const date = order.created_at.split('T')[0];
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            acc[date] = acc[date] || { orders: 0, revenue: 0 };
            acc[date].orders += 1;
            acc[date].revenue += orderTotal;
            return acc;
        }, {});

        res.json({
            totalOrders,
            totalRevenue,
            statusCounts,
            dailyStats
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getOrderStatistics; 