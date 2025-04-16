const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const createOrder = require('../controllers/order/createOrder');
const getUserOrders = require('../controllers/order/getUserOrders');

// Error handling middleware
const handleErrors = (err, req, res, next) => {
    console.error('Order route error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
};

// Create new order
router.post('/', auth, createOrder);

// Get user's orders
router.get('/', auth, getUserOrders);

// Apply error handling middleware
router.use(handleErrors);

module.exports = router; 