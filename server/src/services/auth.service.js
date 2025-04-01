const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const login = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ userId: user._id, roles: user.roles }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

const register = async userData => {
    try {
        const { name, email, password } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            roles: ['user'], // Default role
        });

        // Generate token
        const token = jwt.sign({ userId: user._id, roles: user.roles }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
            },
        };
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

const getProfile = async userId => {
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
};

const updateProfile = async (userId, updateData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Update allowed fields
        const allowedFields = ['name', 'email'];
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                user[key] = updateData[key];
            }
        });

        await user.save();
        return user;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { message: 'Password updated successfully' };
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
};

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};
