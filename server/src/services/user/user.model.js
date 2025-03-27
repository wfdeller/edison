const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');
const { ROLES, ALL_ROLES, isValidRole, areValidRoles } = require('../../constants/roles');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: config.security.passwordMinLength
  },
  roles: {
    type: [{
      type: String,
      enum: ALL_ROLES,
      required: true,
      validate: {
        validator: isValidRole,
        message: props => `${props.value} is not a valid role!`
      }
    }],
    default: [ROLES.USER],
    validate: {
      validator: function(roles) {
        return roles.length > 0 && areValidRoles(roles);
      },
      message: 'User must have at least one valid role'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Helper method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Helper method to check if user has any of the specified roles
userSchema.methods.hasAnyRole = function(roles) {
  return this.roles.some(role => roles.includes(role));
};

// Helper method to check if user has all of the specified roles
userSchema.methods.hasAllRoles = function(roles) {
  return roles.every(role => this.roles.includes(role));
};

// Helper method to check if user has admin role
userSchema.methods.isAdmin = function() {
  return this.hasRole(ROLES.ADMIN);
};

// Helper method to check if user has moderator role
userSchema.methods.isModerator = function() {
  return this.hasRole(ROLES.MODERATOR);
};

// Helper method to check if user has editor role
userSchema.methods.isEditor = function() {
  return this.hasRole(ROLES.EDITOR);
};

module.exports = mongoose.model('User', userSchema); 