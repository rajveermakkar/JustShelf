const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');

// Import order controllers
const createOrder = require('../controllers/order/createOrder');
const getUserOrders = require('../controllers/order/getUserOrders');
const getOrderById = require('../controllers/order/getOrderById');
const updateOrderStatus = require('../controllers/order/updateOrderStatus');

// Protected routes
router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);

// Admin routes
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router; 