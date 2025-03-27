const User = require('./user.model');

class UserService {
  async getAllUsers() {
    return User.find();
  }

  async getUserById(id) {
    return User.findById(id);
  }

  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateUser(id, userData) {
    return User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
  }

  async deleteUser(id) {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  async getTotalUsersCount() {
    try {
      const count = await User.countDocuments();
      // Ensure we're returning a number
      const numericCount = Number(count);
      if (isNaN(numericCount)) {
        throw new Error('Invalid user count');
      }
      return numericCount;
    } catch (error) {
      console.error('Error in getTotalUsersCount service:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 