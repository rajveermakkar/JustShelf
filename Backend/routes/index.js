// Import required modules
const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');

// Import auth controllers
const register = require('../controllers/auth/register');
const login = require('../controllers/user/login');
const getProfile = require('../controllers/user/getProfile');
const updateProfile = require('../controllers/user/updateProfile');
const deleteAccount = require('../controllers/user/deleteAccount');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/user/addressController');

// Import book controllers
const getAllBooks = require('../controllers/book/getAllBooks');
const getBookById = require('../controllers/book/getBookById');
const { createBook, upload: createUpload } = require('../controllers/book/createBook');
const { updateBook, upload: updateUpload } = require('../controllers/book/updateBook');
const deleteBook = require('../controllers/book/deleteBook');
const searchBooks = require('../controllers/book/searchBooks');

// Import order controllers
const getAllOrders = require('../controllers/order/getAllOrders');
const getOrderById = require('../controllers/order/getOrderById');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// User routes
router.get('/users/profile', auth, getProfile);
router.put('/users/profile', auth, updateProfile);
router.delete('/users/profile', auth, deleteAccount);

// Address routes
router.get('/users/addresses', auth, getAddresses);
router.post('/users/addresses', auth, addAddress);
router.put('/users/addresses/:id', auth, updateAddress);
router.delete('/users/addresses/:id', auth, deleteAddress);

// Book routes
router.get('/api/books', getAllBooks);
router.get('/api/books/search', searchBooks);
router.get('/api/books/:id', getBookById);
router.post('/api/books', auth, admin, createUpload.single('image'), createBook);
router.put('/api/books/:id', auth, admin, updateUpload.single('image'), updateBook);
router.delete('/api/books/:id', auth, admin, deleteBook);

// Order routes
router.get('/orders', auth, getAllOrders);
router.get('/orders/:id', auth, getOrderById);

module.exports = router;