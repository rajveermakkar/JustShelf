const { authSupabase, supabase } = require('../../utils/supabaseClient');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // First, authenticate with Supabase Auth
        const { data: authData, error: authError } = await authSupabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Auth successful, user:', authData.user.id);

        // Then, get the user data from our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        // If user doesn't exist in users table, create them
        if (userError && userError.code === 'PGRST116') {
            console.log('User not found in users table, creating new user record');
            // Insert the user into the users table
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: authData.user.id,
                        email: authData.user.email,
                        first_name: authData.user.user_metadata?.first_name || '',
                        last_name: authData.user.user_metadata?.last_name || ''
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.error('User creation error:', insertError);
                return res.status(500).json({ error: 'Failed to create user profile' });
            }

            console.log('New user created:', newUser.id);

            // Return the newly created user data
            return res.json({
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    created_at: newUser.created_at
                },
                session: {
                    access_token: authData.session.access_token,
                    refresh_token: authData.session.refresh_token,
                    expires_at: authData.session.expires_at
                }
            });
        }

        if (userError) {
            console.error('User data error:', userError);
            return res.status(400).json({ error: 'Failed to fetch user data' });
        }

        console.log('Login successful for user:', userData.id);

        // Return combined user data and session
        res.json({
            user: {
                id: userData.id,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                created_at: userData.created_at
            },
            session: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                expires_at: authData.session.expires_at
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
};

module.exports = login; 