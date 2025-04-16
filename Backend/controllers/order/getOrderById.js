const supabase = require('../../utils/supabaseClient');

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                users (
                    id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error getting order by ID:', error);
            return res.status(400).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = getOrderById;