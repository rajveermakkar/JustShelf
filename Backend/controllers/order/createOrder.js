const { supabase, supabaseAdmin } = require('../../config/supabase');

const createOrder = async (req, res) => {
    try {
        // Log the entire request for debugging
        console.log('Full request:', {
            headers: req.headers,
            body: req.body,
            user: req.user
        });

        if (!req.user || !req.user.id) {
            console.error('Authentication error:', req.user);
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { items, shipping_address, payment_method, total_amount } = req.body;
        const userId = req.user.id;

        console.log('Received order data:', {
            userId,
            items,
            shipping_address,
            payment_method,
            total_amount
        });

        // Validate required fields with detailed logging
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('Invalid items:', items);
            return res.status(400).json({ error: 'Invalid or empty items array' });
        }

        if (!shipping_address || typeof shipping_address !== 'object') {
            console.error('Invalid shipping address:', shipping_address);
            return res.status(400).json({ error: 'Invalid shipping address' });
        }

        if (!payment_method) {
            console.error('Missing payment method');
            return res.status(400).json({ error: 'Payment method is required' });
        }

        if (!total_amount || isNaN(total_amount)) {
            console.error('Invalid total amount:', total_amount);
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // Validate each item
        for (const item of items) {
            if (!item.id || !item.quantity || !item.price) {
                console.error('Invalid item:', item);
                return res.status(400).json({ error: 'Invalid item data' });
            }
        }

        // Check stock availability for all items
        const bookIds = items.map(item => item.id);
        const { data: books, error: booksError } = await supabaseAdmin
            .from('books')
            .select('id, stock_quantity')
            .in('id', bookIds);

        if (booksError) {
            console.error('Error checking stock:', booksError);
            return res.status(500).json({ error: 'Failed to check stock availability' });
        }

        // Create a map of book stock quantities
        const stockMap = books.reduce((acc, book) => {
            acc[book.id] = book.stock_quantity;
            return acc;
        }, {});

        // Verify stock availability for each item
        for (const item of items) {
            const availableStock = stockMap[item.id];
            if (availableStock === undefined) {
                return res.status(400).json({ error: `Book with ID ${item.id} not found` });
            }
            if (availableStock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for book ID ${item.id}. Available: ${availableStock}, Requested: ${item.quantity}` 
                });
            }
        }

        // Start a transaction
        const { data: order, error: orderError } = await supabaseAdmin.rpc('create_order_with_stock_update', {
            p_user_id: userId,
            p_items: items,
            p_shipping_address: shipping_address,
            p_payment_method: payment_method,
            p_total_amount: total_amount
        });

        if (orderError) {
            console.error('Error creating order:', {
                error: orderError,
                message: orderError.message,
                details: orderError.details,
                hint: orderError.hint,
                code: orderError.code
            });
            return res.status(500).json({ 
                error: 'Failed to create order',
                details: orderError.message,
                code: orderError.code
            });
        }

        console.log('Order created successfully:', order);

        // Return the order
        res.status(201).json({ 
            success: true,
            message: 'Order placed successfully',
            order 
        });

    } catch (error) {
        console.error('Unexpected error in createOrder:', {
            error: error,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
};

module.exports = createOrder; 