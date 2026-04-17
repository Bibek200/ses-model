const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');

// Public routes
router.post('/login', login);

// Protected routes (any logged-in user)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin-only routes
router.post('/register', protect, authorize('super_admin', 'admin'), register);
router.get('/users', protect, authorize('super_admin', 'admin'), getUsers);
router.put('/users/:id', protect, authorize('super_admin', 'admin'), updateUser);
router.delete('/users/:id', protect, authorize('super_admin'), deleteUser);

module.exports = router;
