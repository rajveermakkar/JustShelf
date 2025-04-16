const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const deleteOrder = async (req, res) => {
    console.log('Delete order request received:', {
        orderId: req.params.id,
        timestamp: new Date().toISOString()
    });

    try {
        const { id } = req.params;

        if (!id) {
            console.log('Delete order failed: Missing order ID');
            return res.status(400).json({ error: 'Order ID is required' });
        }

        console.log('Checking if order exists:', { orderId: id });

        // First check if the order exists
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error checking order existence:', {
                error: fetchError,
                orderId: id,
                timestamp: new Date().toISOString()
            });
            return res.status(500).json({ error: 'Failed to check order existence' });
        }

        if (!existingOrder) {
            console.log('Order not found:', { orderId: id });
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('Order found, proceeding with deletion:', { orderId: id });

        // Delete the order from Supabase
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting order:', {
                error,
                orderId: id,
                timestamp: new Date().toISOString()
            });
            return res.status(500).json({ error: 'Failed to delete order' });
        }

        console.log('Order deleted successfully:', {
            orderId: id,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Unexpected error in deleteOrder:', {
            error,
            orderId: req.params.id,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = deleteOrder; 