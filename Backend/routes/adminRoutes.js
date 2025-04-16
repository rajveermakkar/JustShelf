const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, admin } = require('../middleware/auth');
const { getUsers, updateUser, deleteUser } = require('../controllers/admin/userController');
const getAdminOrders = require('../controllers/admin/getAdminOrders');
const updateOrderStatus = require('../controllers/admin/updateOrderStatus');
const deleteOrder = require('../controllers/admin/deleteOrder');
const getOrderStatistics = require('../controllers/admin/getOrderStatistics');
const getDashboardStats = require('../controllers/admin/adminDashboardController');
const getOrderById = require('../controllers/admin/getOrderById');
const getUserById = require('../controllers/admin/getUserById');
const { uploadFile } = require('../controllers/admin/uploadController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// User management routes
router.get('/users', auth, admin, getUsers);
router.get('/users/:id', auth, admin, getUserById);
router.put('/users/:id', auth, admin, updateUser);
router.delete('/users/:id', auth, admin, deleteUser);

// Order management routes
router.get('/orders', auth, admin, getAdminOrders);
router.get('/orders/:id', auth, admin, getOrderById);
router.get('/orders/statistics', auth, admin, getOrderStatistics);
router.get('/dashboard/stats', auth, admin, getDashboardStats);
router.put('/orders/:id/status', auth, admin, updateOrderStatus);
router.delete('/orders/:id', auth, admin, deleteOrder);

// Upload route
router.post('/upload', auth, admin, upload.single('file'), uploadFile);

module.exports = router; 