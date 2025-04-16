const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Fallback for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Set default content type to JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`- Books: http://localhost:${PORT}/api/books`);
    console.log(`- Orders: http://localhost:${PORT}/api/orders`);
    console.log(`- Auth: http://localhost:${PORT}/api/auth`);
    console.log(`- Admin: http://localhost:${PORT}/api/admin`);
});