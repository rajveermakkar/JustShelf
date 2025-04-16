const { supabase } = require('../../utils/supabaseClient');

const deleteAddress = async (req, res) => {
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

        // Delete the address
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

module.exports = deleteAddress; 