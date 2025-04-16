const { supabase } = require('../../utils/supabaseClient');

const getAllBooks = async (req, res) => {
    try {
        console.log('Fetching books from Supabase...');
        console.log('Supabase URL:', process.env.SUPABASE_URL);
        console.log('Request headers:', req.headers);
        
        // Fetch all books
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching books:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({ 
                error: 'Failed to fetch books',
                details: error.message 
            });
        }

        if (!data || data.length === 0) {
            console.log('No books found in the database');
            return res.json([]);
        }

        console.log(`Successfully fetched ${data.length} books`);
        res.json(data);
    } catch (error) {
        console.error('Server error in getAllBooks:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

module.exports = getAllBooks;