const { supabase } = require('../../config/supabase');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        // Get user data from users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (userError) {
            console.error('User fetch error:', userError);
            return res.status(400).json({ error: userError.message });
        }

        // Check if user is an admin
        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // Return success response with user data and session
        res.status(200).json({
            message: 'Admin login successful',
            user: {
                id: userData.id,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role
            },
            session: authData.session
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login }; 