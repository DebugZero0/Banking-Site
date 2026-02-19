const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Initialize Express app
const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Import routes
const authRoutes = require('./Routes/auth.route');
const accountRoutes = require('./Routes/accounts.routes');
const transactionRoutes = require('./Routes/transaction.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found', 
        path: req.path,
        status: 'failed'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({ 
        message: process.env.NODE_ENV === 'production' ? 'Server error' : message,
        status: 'error',
        ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
});

module.exports = app;