const { supabase } = require('../../utils/supabaseClient');

// Get all addresses for a user
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('users_addresses')
            .select('*')
            .eq('user_id', userId);

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

// Add a new address
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { address_line1, address_line2, city, state, postal_code, is_default } = req.body;

        // If this is set as default, unset any other default addresses
        if (is_default) {
            await supabase
                .from('users_addresses')
                .update({ is_default: false })
                .eq('user_id', userId)
                .eq('is_default', true);
        }

        const { data, error } = await supabase
            .from('users_addresses')
            .insert([
                {
                    user_id: userId,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    is_default
                }
            ])
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

// Update an address
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const { address_line1, address_line2, city, state, postal_code, is_default } = req.body;

        // If this is set as default, unset any other default addresses
        if (is_default) {
            await supabase
                .from('users_addresses')
                .update({ is_default: false })
                .eq('user_id', userId)
                .eq('is_default', true);
        }

        const { data, error } = await supabase
            .from('users_addresses')
            .update({
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                is_default
            })
            .eq('id', addressId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating address:', error);
            return res.status(500).json({ error: 'Failed to update address' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error in updateAddress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const { error } = await supabase
            .from('users_addresses')
            .delete()
            .eq('id', addressId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting address:', error);
            return res.status(500).json({ error: 'Failed to delete address' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Server error in deleteAddress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
}; 