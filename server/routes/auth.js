const express = require('express');
const authController = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate, 
  validatePasswordChange 
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware require authentication

// User profile routes
router.get('/me', authController.getMe);
router.patch('/update-profile', validateProfileUpdate, authController.updateProfile);
router.patch('/change-password', validatePasswordChange, authController.changePassword);

// Admin only routes
router.post('/create-admin', isAdmin, authController.createAdmin);
router.get('/users', isAdmin, authController.getAllUsers);
router.patch('/users/:userId/role', isAdmin, authController.updateUserRole);

module.exports = router;
