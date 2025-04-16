const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');

// Import book controllers
const getAllBooks = require('../controllers/book/getAllBooks');
const getBookById = require('../controllers/book/getBookById');
const { createBook, upload: createUpload } = require('../controllers/book/createBook');
const { updateBook, upload: updateUpload } = require('../controllers/book/updateBook');
const deleteBook = require('../controllers/book/deleteBook');
const searchBooks = require('../controllers/book/searchBooks');

// Public routes
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Admin routes
router.post('/', admin, createUpload.single('image'), createBook);
router.put('/:id', admin, updateUpload.single('image'), updateBook);
router.delete('/:id', admin, deleteBook);

module.exports = router;