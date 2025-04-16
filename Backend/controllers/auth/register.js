const { authSupabase } = require('../../utils/supabaseClient');

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role = 'user' } = req.body;
    console.log('➡️ Registration attempt:', { email, first_name, last_name, role });

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await authSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first_name || '',
          last_name: last_name || '',
          role: role || 'user'
        }
      }
    });

    // Handle auth failure
    if (authError) {
      console.error('🔥 Supabase Auth Error:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      return res.status(500).json({
        error: 'Failed to create user account',
        details: authError.message
      });
    }

    if (!authData.user) {
      console.error('❌ No user data returned from signup');
      return res.status(500).json({
        error: 'User creation failed - no user data returned'
      });
    }

    // Get the session token
    const { data: sessionData, error: sessionError } = await authSupabase.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError) {
      console.error('🔥 Session creation error:', sessionError);
      return res.status(500).json({
        error: 'Failed to create session',
        details: sessionError.message
      });
    }

    console.log('✅ User created successfully:', {
      id: authData.user.id,
      email: authData.user.email
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        first_name,
        last_name,
        role
      },
      token: sessionData.session.access_token
    });
  } catch (err) {
    console.error('❌ Registration error:', {
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
};

module.exports = register;
