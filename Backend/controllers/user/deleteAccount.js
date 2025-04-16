const supabase = require('../../utils/supabaseClient');

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (deleteError) {
            return res.status(400).json({ error: deleteError.message });
        }

        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = deleteAccount; 