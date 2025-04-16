const { supabase } = require('../../utils/supabaseClient');

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: book, error: fetchError } = await supabase
            .from('books')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(400).json({ error: fetchError.message });
        }

        if (book && book.image_url) {
            const fileName = book.image_url.split('/').pop();
            await supabase.storage
                .from('book-images')
                .remove([fileName]);
        }

        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = deleteBook; 