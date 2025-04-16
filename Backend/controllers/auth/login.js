const { authSupabase, supabase } = require('../../utils/supabaseClient');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n🔵 ===== Login Attempt =====');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password ? '******' : 'missing');

    // Basic validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    console.log('🔄 Attempting Supabase authentication...');
    // Sign in user via Supabase Auth
    const { data, error } = await authSupabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('🔥 Authentication Error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        details: error.message
      });
    }

    if (!data.user) {
      console.log('❌ No user data returned from Supabase');
      return res.status(401).json({
        error: 'Login failed - no user data returned'
      });
    }

    // Get latest user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.log('❌ Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Update auth user metadata with latest role
    const { error: updateError } = await authSupabase.auth.admin.updateUserById(
      data.user.id,
      { user_metadata: { role: userData.role } }
    );

    if (updateError) {
      console.log('⚠️ Warning: Failed to update auth metadata:', updateError);
    }

    console.log('\n✅ Login Successful!');
    console.log('👤 User Details:', {
      id: data.user.id,
      email: data.user.email,
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name
    });
    console.log('🔑 Session Token:', data.session.access_token ? 'Present' : 'Missing');
    console.log('================================\n');

    // Return appropriate response based on role
    return res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      },
      token: data.session.access_token
    });
  } catch (error) {
    console.error('🔥 Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = login;