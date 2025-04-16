const { supabase } = require('../../utils/supabaseClient');

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('🔵 ===== Order Status Update Request =====');
        console.log('📦 Order ID:', id);
        console.log('🔄 New Status:', status);
        console.log('🔑 Auth Token:', req.headers.authorization?.split(' ')[1] ? 'Present' : 'Missing');

        if (!status) {
            console.log('❌ Error: Status is required');
            return res.status(400).json({ error: 'Status is required' });
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            console.log('❌ Error: Invalid status value:', status);
            return res.status(400).json({ error: 'Invalid status value' });
        }

        console.log('🔄 Attempting to update order status in Supabase...');
        // Update order status using Supabase
        const { data, error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.log('🔥 Supabase Error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            console.log('❌ Error: Order not found');
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('✅ Order status updated successfully:', {
            orderId: data.id,
            newStatus: data.status,
            updatedAt: data.updated_at
        });
        console.log('================================\n');

        res.status(200).json({
            message: 'Order status updated successfully',
            order: data
        });
    } catch (error) {
        console.log('🔥 Server Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

module.exports = updateOrderStatus;