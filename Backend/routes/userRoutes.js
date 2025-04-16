const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import user controllers
const getProfile = require('../controllers/user/getProfile');
const updateProfile = require('../controllers/user/updateProfile');
const getAddresses = require('../controllers/user/getAddresses');
const addAddress = require('../controllers/user/addAddress');
const deleteAddress = require('../controllers/user/deleteAddress');
const setDefaultAddress = require('../controllers/user/setDefaultAddress');

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/addresses', auth, getAddresses);
router.post('/addresses', auth, addAddress);
router.delete('/addresses/:id', auth, deleteAddress);
router.put('/addresses/:id/default', auth, setDefaultAddress);

module.exports = router;