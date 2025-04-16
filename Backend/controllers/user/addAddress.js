const { supabase } = require('../../utils/supabaseClient');

const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { address_line1, address_line2, city, state, postal_code, is_default } = req.body;

        // If this is a default address, unset other default addresses
        if (is_default) {
            const { error: updateError } = await supabase
                .from('users_addresses')
                .update({ is_default: false })
                .eq('user_id', userId)
                .eq('is_default', true);

            if (updateError) {
                console.error('Error updating default addresses:', updateError);
                return res.status(500).json({ error: 'Failed to update default addresses' });
            }
        }

        // Add new address
        const { data, error } = await supabase
            .from('users_addresses')
            .insert({
                user_id: userId,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                is_default,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding address:', error);
            return res.status(500).json({ error: 'Failed to add address' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error in addAddress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = addAddress; 