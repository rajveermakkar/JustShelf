const { supabase } = require('../../utils/supabaseClient');

const getAdminOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        // Build the query for all orders
        let query = supabase
            .from('orders')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        // Add pagination
        query = query.range(offset, offset + limit - 1)
                    .order('created_at', { ascending: false });

        const { data: orders, error, count } = await query;

        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        // Get user details for all orders
        let userDetails = {};
        if (orders.length > 0) {
            const userIds = [...new Set(orders.map(order => order.user_id))];
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, email, first_name, last_name')
                .in('id', userIds);

            if (!userError) {
                users.forEach(user => {
                    userDetails[user.id] = {
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name
                    };
                });
            }
        }

        // Format response
        const response = {
            orders: orders.map(order => {
                // Parse the items and shipping_address JSON strings
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                const shippingAddress = typeof order.shipping_address === 'string' 
                    ? JSON.parse(order.shipping_address) 
                    : order.shipping_address;

                return {
                    id: order.id,
                    total: order.total_amount,
                    status: order.status,
                    createdAt: order.created_at,
                    updatedAt: order.updated_at,
                    items,
                    shippingAddress,
                    paymentMethod: order.payment_method,
                    user: userDetails[order.user_id]
                };
            }),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getAdminOrders; 