const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Settings = require('../settings/settings.model');
const config = require('../../config/config');
const { ROLES } = require('../../constants/roles');

class AuthService {
  constructor() {
    this.jwtSecret = config.jwt.secret;
    this.jwtExpiresIn = config.jwt.expiresIn;
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if email verification is required
    const settings = await Settings.getSettingsByCategory('authentication');
    if (settings.requireEmailVerification && !user.isEmailVerified) {
      throw new Error('Email verification required');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };
  }

  async register(userData) {
    const settings = await Settings.getSettingsByCategory('authentication');
    
    // Check if registration is allowed
    if (!settings.allowRegistration) {
      throw new Error('Registration is currently disabled');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Ensure new users get the USER role
    userData.roles = [ROLES.USER];

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.roles;
    delete updateData.email;

    Object.assign(user, updateData);
    await user.save();

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService(); 