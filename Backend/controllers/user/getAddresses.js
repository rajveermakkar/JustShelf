const { supabase } = require('../../utils/supabaseClient');

const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('users_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) {
            console.error('Error fetching addresses:', error);
            return res.status(500).json({ error: 'Failed to fetch addresses' });
        }

        res.json(data || []);
    } catch (error) {
        console.error('Server error in getAddresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getAddresses; 