const { supabase } = require('../../utils/supabaseClient');

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        items,
        total_amount,
        shipping_address,
        payment_method,
        status,
        created_at,
        updated_at,
        users (
          id,
          email,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Parse JSON fields if they are strings
    if (typeof order.items === 'string') {
      order.items = JSON.parse(order.items);
    }
    if (typeof order.shipping_address === 'string') {
      order.shipping_address = JSON.parse(order.shipping_address);
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to get order' });
  }
};

module.exports = getOrderById;