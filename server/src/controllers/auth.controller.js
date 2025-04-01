const authService = require('../services/auth.service');
const User = require('../models/User');
const { ROLES, areValidRoles } = require('../constants/roles');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            message: error.message || 'Login failed',
        });
    }
};

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            message: error.message || 'Registration failed',
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.userId);
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(404).json({
            message: error.message || 'Failed to get profile',
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await authService.updateProfile(req.user.userId, req.body);
        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({
            message: error.message || 'Failed to update profile',
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(
            req.user.userId,
            currentPassword,
            newPassword
        );
        res.json(result);
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({
            message: error.message || 'Failed to change password',
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roles } = req.body;

        // Validate roles
        if (!Array.isArray(roles) || roles.length === 0) {
            return res.status(400).json({ message: 'Roles must be a non-empty array' });
        }

        if (!areValidRoles(roles)) {
            return res.status(400).json({ message: 'Invalid role(s) provided' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent removing admin role from the last admin
        if (roles.includes(ROLES.ADMIN)) {
            const adminCount = await User.countDocuments({ roles: ROLES.ADMIN });
            if (
                adminCount === 1 &&
                user.roles.includes(ROLES.ADMIN) &&
                !roles.includes(ROLES.ADMIN)
            ) {
                return res.status(400).json({ message: 'Cannot remove the last admin' });
            }
        }

        user.roles = roles;
        await user.save();

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            roles: user.roles,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserRoles,
};
