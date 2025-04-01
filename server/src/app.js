const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { verifyToken } = require('./middleware/auth');
const { isAdmin } = require('./middleware/isAdmin');
const routes = require('./routes');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', routes.authRoutes);
app.use('/api/users', verifyToken, routes.userRoutes);
app.use('/api/videos', verifyToken, routes.videoRoutes);
app.use('/api/settings', verifyToken, isAdmin, routes.settingsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

module.exports = app;
