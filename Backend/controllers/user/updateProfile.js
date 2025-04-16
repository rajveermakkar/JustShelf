const { supabase } = require('../../utils/supabaseClient');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, phone_number } = req.body;

        // Update user profile
        const { data, error } = await supabase
            .from('users')
            .update({
                first_name,
                last_name,
                phone: phone_number,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        if (!data) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error in updateProfile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = updateProfile;