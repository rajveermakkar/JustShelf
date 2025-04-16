const { supabase } = require('../../utils/supabaseClient');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to generate a 12-character ID
const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const createBook = async (req, res) => {
    try {
        const {
            title,
            author,
            description,
            price,
            stock_quantity,
            category,
            image_url: providedImageUrl,
            isbn,
            page_count,
            rating = 0,
            reviews = 0
        } = req.body;

        let image_url = providedImageUrl || '';

        // Handle file upload if present
        if (req.file) {
            const fileExt = path.extname(req.file.originalname);
            const fileName = `${Date.now()}${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('book-images')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return res.status(400).json({ error: 'Failed to upload image' });
            }

            const { data: { publicUrl } } = supabase.storage
                .from('book-images')
                .getPublicUrl(fileName);

            image_url = publicUrl;
        }

        console.log('Creating book with image URL:', image_url);

        const { data, error } = await supabase
            .from('books')
            .insert([
                {
                    id: generateId(),
                    title,
                    author,
                    description,
                    price,
                    image_url,
                    stock_quantity,
                    category,
                    isbn,
                    page_count: parseInt(page_count) || 0,
                    rating: parseFloat(rating) || 0,
                    reviews: parseInt(reviews) || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            if (error.code === '23505' && error.message.includes('isbn')) {
                return res.status(400).json({ 
                    error: 'ISBN already exists',
                    details: 'A book with this ISBN is already in the system. Please check the ISBN or update the existing book.'
                });
            }
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createBook, upload }; 