const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/admin/userController');
const { getAdminOrders } = require('../controllers/admin/getAdminOrders');
const { getDashboardStats } = require('../controllers/admin/getDashboardStats');

// User management routes
router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.put('/users/:id', authenticateToken, isAdmin, updateUser);
router.delete('/users/:id', authenticateToken, isAdmin, deleteUser);

// Order management routes
router.get('/orders', authenticateToken, isAdmin, getAdminOrders);

// Dashboard routes
router.get('/dashboard/stats', authenticateToken, isAdmin, getDashboardStats);

module.exports = router;