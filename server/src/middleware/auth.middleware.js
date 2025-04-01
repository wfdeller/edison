const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { ROLES, hasRolePermission } = require('../constants/roles');

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check if user has any of the required roles
const hasAnyRole = roles => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const hasRole = req.user.roles.some(userRole =>
            roles.some(requiredRole => hasRolePermission(userRole, requiredRole))
        );

        if (!hasRole) {
            return res.status(403).json({
                message: 'Access denied',
                requiredRoles: roles,
                userRoles: req.user.roles,
            });
        }

        next();
    };
};

// Middleware to check if user has all of the required roles
const hasAllRoles = roles => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const hasAll = roles.every(requiredRole =>
            req.user.roles.some(userRole => hasRolePermission(userRole, requiredRole))
        );

        if (!hasAll) {
            return res.status(403).json({
                message: 'Access denied',
                requiredRoles: roles,
                userRoles: req.user.roles,
            });
        }

        next();
    };
};

// Convenience middleware for common role checks
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.roles.includes('admin')) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const isModerator = hasAnyRole([ROLES.MODERATOR, ROLES.ADMIN]);
const isEditor = hasAnyRole([ROLES.EDITOR, ROLES.MODERATOR, ROLES.ADMIN]);
const isUser = (req, res, next) => {
    if (!req.user || !req.user.roles.includes('user')) {
        return res.status(403).json({ message: 'User access required' });
    }
    next();
};

module.exports = {
    verifyToken,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isModerator,
    isEditor,
    isUser,
};
