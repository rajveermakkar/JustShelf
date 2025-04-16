const { supabase } = require('../../utils/supabaseClient');

const getBookById = async (req, res) => {
    const { id } = req.params;
    
    console.log(`[getBookById] Attempting to fetch book with ID: ${id}`);
    
    if (!id) {
        console.error('[getBookById] No book ID provided');
        return res.status(400).json({ error: 'Book ID is required' });
    }

    try {
        // Fetch book details
        const { data: book, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[getBookById] Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch book details' });
        }

        if (!book) {
            console.log(`[getBookById] Book with ID ${id} not found`);
            return res.status(404).json({ error: 'Book not found' });
        }

        console.log(`[getBookById] Successfully fetched book:`, book);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(book);
    } catch (error) {
        console.error('[getBookById] Unexpected error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
};

module.exports = getBookById;