const authService = require('./auth.service');
const User = require('../user/user.model');
const { ROLES, areValidRoles } = require('../../constants/roles');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async register(req, res) {
    console.log('auth.controller.register - starting');
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUserRoles(req, res) {
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
        if (adminCount === 1 && user.roles.includes(ROLES.ADMIN) && !roles.includes(ROLES.ADMIN)) {
          return res.status(400).json({ message: 'Cannot remove the last admin' });
        }
      }

      user.roles = roles;
      await user.save();

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController(); 