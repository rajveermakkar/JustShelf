const { supabase } = require('../../utils/supabaseClient');

const searchBooks = async (req, res) => {
    try {
        const { q, category } = req.query;
        let supabaseQuery = supabase
            .from('books')
            .select('*');

        if (q) {
            supabaseQuery = supabaseQuery.or(
                `title.ilike.%${q}%,author.ilike.%${q}%,description.ilike.%${q}%`
            );
        }

        if (category) {
            supabaseQuery = supabaseQuery.eq('category', category);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
            console.error('Search error:', error);
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = searchBooks;