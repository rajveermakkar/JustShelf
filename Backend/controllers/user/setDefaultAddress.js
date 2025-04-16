const { supabase } = require('../../utils/supabaseClient');

const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        // First check if the address belongs to the user
        const { data: address, error: checkError } = await supabase
            .from('users_addresses')
            .select('*')
            .eq('id', addressId)
            .eq('user_id', userId)
            .single();

        if (checkError || !address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Start a transaction to update addresses
        const { error: updateError } = await supabase
            .from('users_addresses')
            .update({ is_default: false })
            .eq('user_id', userId)
            .neq('id', addressId);

        if (updateError) {
            console.error('Error updating other addresses:', updateError);
            return res.status(500).json({ error: 'Failed to update addresses' });
        }

        // Set the selected address as default
        const { error: setDefaultError } = await supabase
            .from('users_addresses')
            .update({ is_default: true })
            .eq('id', addressId)
            .eq('user_id', userId);

        if (setDefaultError) {
            console.error('Error setting default address:', setDefaultError);
            return res.status(500).json({ error: 'Failed to set default address' });
        }

        res.json({ message: 'Default address updated successfully' });
    } catch (error) {
        console.error('Server error in setDefaultAddress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = setDefaultAddress; 