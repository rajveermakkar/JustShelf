const { supabase, authSupabase } = require('../../utils/supabaseClient');

const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ users: Array.isArray(users) ? users : [] });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role } = req.body;

    console.log('🔵 ===== User Update Request =====');
    console.log('👤 User ID:', id);
    console.log('📝 Update Data:', { first_name, last_name, role });
    console.log('🔑 Auth Token:', req.headers.authorization?.split(' ')[1] ? 'Present' : 'Missing');

    if (!id) {
      console.log('❌ Error: User ID is required');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate role if provided
    if (role && !['admin', 'user'].includes(role)) {
      console.log('❌ Error: Invalid role value:', role);
      return res.status(400).json({ error: 'Invalid role value' });
    }

    console.log('🔄 Attempting to update user in Supabase...');
    // Update user using Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ 
        first_name, 
        last_name, 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.log('🔥 Supabase Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      console.log('❌ Error: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User updated successfully');
    res.json({ 
      user: data,
      message: 'User updated successfully. Note: Email updates are not allowed for security reasons.'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser
};