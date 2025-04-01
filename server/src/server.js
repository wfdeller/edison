/**
 * server/src/server.js
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('./config/config');
const Settings = require('./models/Settings');

const userRoutes = require('./routes/user.routes');
const settingsRoutes = require('./routes/settings.routes');
const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const auditRoutes = require('./routes/audit.routes');
const { createAuditMiddleware } = require('./middleware/audit.middleware');
const systemRoutes = require('./routes/system.routes');

const app = express();

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173', // Vite's default port
            config.cors.origin,
        ].filter(Boolean); // Remove any undefined values

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight requests for 10 minutes
};

// Middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
app.use(cors(corsOptions));
app.use(express.json());

// Enhanced Morgan logging configuration
morgan.token('body', req => JSON.stringify(req.body));
morgan.token('user', req => (req.user ? req.user.id : 'anonymous'));
morgan.token('ip', req => req.ip);
morgan.token('user-agent', req => req.get('user-agent'));

// Use a custom format for development
const morganFormat =
    config.server.nodeEnv === 'development'
        ? ':method :url :status :response-time ms - :user - :ip - :user-agent - :body'
        : ':method :url :status :response-time ms - :user';

app.use(
    morgan(morganFormat, {
        skip: req => req.url === '/health', // Skip health check endpoints
    })
);

// Mount auth routes first (no authentication required)
app.use('/api/auth', authRoutes);

// Apply audit middleware to protected routes
app.use('/api/users', createAuditMiddleware('User'));
app.use('/api/settings', createAuditMiddleware('Settings'));
app.use('/api/videos', createAuditMiddleware('Video'));

// Mount remaining routes
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/system', systemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Function to verify required settings
const verifyRequiredSettings = async () => {
    try {
        const settings = await Settings.getAllSettings();

        // Check if settings exist
        if (!settings || Object.keys(settings).length === 0) {
            console.log('No settings found. Initializing default settings...');
            await Settings.initializeDefaults();
            return;
        }

        // Verify required categories exist
        const requiredCategories = ['authentication', 'security', 'appearance', 'general'];
        const missingCategories = requiredCategories.filter(category => !settings[category]);

        if (missingCategories.length > 0) {
            console.log(`Missing required settings categories: ${missingCategories.join(', ')}`);
            console.log('Initializing missing settings...');
            await Settings.initializeDefaults();
            return;
        }

        // Verify critical settings exist
        const criticalSettings = {
            authentication: ['requireEmailVerification', 'allowRegistration', 'sessionTimeout'],
            security: ['passwordMinLength', 'maxLoginAttempts', 'lockoutDuration'],
            general: ['siteName', 'siteDescription', 'contactEmail'],
        };

        for (const [category, keys] of Object.entries(criticalSettings)) {
            const missingSettings = keys.filter(key => !settings[category][key]);
            if (missingSettings.length > 0) {
                console.log(
                    `Missing critical settings in ${category}: ${missingSettings.join(', ')}`
                );
                console.log('Initializing missing settings...');
                await Settings.initializeDefaults();
                return;
            }
        }

        console.log('All required settings are properly configured.');
    } catch (error) {
        console.error('Error verifying settings:', error);
        throw error;
    }
};

// Initialize server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');

        // Verify settings
        await verifyRequiredSettings();

        // Start the server
        app.listen(config.server.port, () => {
            console.log(
                `Server is running on port ${config.server.port} in ${config.server.nodeEnv} mode`
            );
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
