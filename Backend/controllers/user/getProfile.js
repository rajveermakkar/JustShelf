const { supabase, authSupabase } = require('../../utils/supabaseClient');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // First get the auth user data
        const { data: authUser, error: authError } = await authSupabase.auth.getUser(req.headers.authorization.split(' ')[1]);

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        // Then get the user profile data
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            return res.status(400).json({ error: profileError.message });
        }

        if (!profileData) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Get user addresses
        const { data: addresses, error: addressesError } = await supabase
            .from('users_addresses')
            .select('*')
            .eq('user_id', userId);

        if (addressesError) {
            console.error('Addresses error:', addressesError);
            // Don't fail the request if addresses fail to load
        }

        // Combine all the data
        const response = {
            ...profileData,
            email: authUser.user.email,
            addresses: addresses || []
        };

        console.log('Profile data fetched:', response);
        res.json(response);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = getProfile;