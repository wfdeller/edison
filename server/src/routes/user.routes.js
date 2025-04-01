const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/count', verifyToken, isAdmin, userController.getTotalUsersCount);
router.get('/:id', verifyToken, isAdmin, userController.getUserById);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.put('/:id', verifyToken, isAdmin, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
