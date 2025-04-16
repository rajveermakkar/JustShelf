const supabase = require('../../utils/supabaseClient');

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // First verify the current password
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (userError) {
            return res.status(400).json({ error: userError.message });
        }

        // Try to sign in with current password to verify it
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: currentPassword
        });

        if (signInError) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update the password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = changePassword; 