const { supabase } = require('../../utils/supabaseClient');

const getUserById = async (req, res) => {
  try {
    console.log('getUserById - Starting request');
    const { id } = req.params;

    console.log('getUserById - Fetching user:', id);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) {
      console.error('getUserById - Supabase error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user) {
      console.log('getUserById - User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('users_addresses')
      .select('*')
      .eq('user_id', id);

    if (addressesError) {
      console.error('getUserById - Error fetching addresses:', addressesError);
    }

    // Fetch user orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('getUserById - Error fetching orders:', ordersError);
    }

    // Combine all data
    const response = {
      ...user,
      addresses: addresses || [],
      orders: orders || []
    };

    console.log('getUserById - Successfully fetched user with details');
    res.json(response);
  } catch (error) {
    console.error('getUserById - Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
};

module.exports = getUserById; 