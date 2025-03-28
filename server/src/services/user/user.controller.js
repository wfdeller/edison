const userService = require('./user.service');

class UserController {
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await userService.updateUser(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const success = await userService.deleteUser(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getTotalUsersCount(req, res) {
        try {
            const count = await userService.getTotalUsersCount();
            // Ensure we're sending a number
            const numericCount = Number(count);
            if (isNaN(numericCount)) {
                throw new Error('Failed to get valid user count');
            }
            res.json({ count: numericCount });
        } catch (error) {
            console.error('Error in getTotalUsersCount:', error);
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = new UserController();
