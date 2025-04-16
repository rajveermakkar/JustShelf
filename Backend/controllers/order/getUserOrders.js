const { supabase } = require('../../utils/supabaseClient');

const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Build the query for user's orders
        const { data: orders, error, count } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
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
                    paymentMethod: order.payment_method
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

module.exports = getUserOrders; 