const { supabase } = require('../../utils/supabaseClient');

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('users')
            .select('*', { count: 'exact' });

        // Apply filters
        if (role) {
            query = query.eq('role', role);
        }
        if (search) {
            query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
        }

        // Add pagination
        query = query.range(offset, offset + limit - 1);

        const { data: users, error, count } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = getAllUsers;