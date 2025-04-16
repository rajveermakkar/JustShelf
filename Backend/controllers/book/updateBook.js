const { supabase } = require('../../utils/supabaseClient');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        // Handle text fields
        if (req.body.title) updates.title = req.body.title;
        if (req.body.author) updates.author = req.body.author;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.price) updates.price = parseFloat(req.body.price);
        if (req.body.stock_quantity) updates.stock_quantity = parseInt(req.body.stock_quantity);
        if (req.body.category) updates.category = req.body.category;
        if (req.body.isbn) updates.isbn = req.body.isbn;
        if (req.body.page_count) updates.page_count = parseInt(req.body.page_count);
        if (req.body.rating) updates.rating = parseFloat(req.body.rating);
        if (req.body.reviews) updates.reviews = parseInt(req.body.reviews);

        // Handle image upload or URL
        if (req.file) {
            // Handle file upload
            const fileExt = path.extname(req.file.originalname);
            const fileName = `${Date.now()}${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('book-images')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return res.status(400).json({ error: 'Failed to upload image', details: uploadError.message });
            }

            const { data: { publicUrl } } = supabase.storage
                .from('book-images')
                .getPublicUrl(fileName);

            updates.image_url = publicUrl;
        } else if (req.body.image_url) {
            // Handle direct image URL
            updates.image_url = req.body.image_url;
        }

        // Add updated_at timestamp
        updates.updated_at = new Date().toISOString();

        console.log('Updating book with:', updates);

        const { data, error } = await supabase
            .from('books')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return res.status(400).json({ error: 'Failed to update book', details: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = { updateBook, upload }; 