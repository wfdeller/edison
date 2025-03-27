const authService = require('./auth.service');
const { ROLES, hasRolePermission } = require('../../constants/roles');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('verifyToken - No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // Ensure user has at least one role
    if (!decoded.roles || decoded.roles.length === 0) {
      decoded.roles = [ROLES.USER];
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user has any of the required roles
const hasAnyRole = (roles) => {
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
        userRoles: req.user.roles
      });
    }

    next();
  };
};

// Middleware to check if user has all of the required roles
const hasAllRoles = (roles) => {
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
        userRoles: req.user.roles
      });
    }

    next();
  };
};

// Convenience middleware for common role checks
const isAdmin = hasAnyRole([ROLES.ADMIN]);
const isModerator = hasAnyRole([ROLES.MODERATOR, ROLES.ADMIN]);
const isEditor = hasAnyRole([ROLES.EDITOR, ROLES.MODERATOR, ROLES.ADMIN]);
const isUser = hasAnyRole([ROLES.USER, ROLES.EDITOR, ROLES.MODERATOR, ROLES.ADMIN]);

module.exports = {
  verifyToken,
  hasAnyRole,
  hasAllRoles,
  isAdmin,
  isModerator,
  isEditor,
  isUser
}; 