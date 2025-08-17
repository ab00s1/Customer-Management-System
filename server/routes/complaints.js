const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect, isAdmin } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Public routes (authenticated users)
router.post('/', validateComplaint, complaintController.createComplaint);
router.get('/my-complaints', complaintController.getMyComplaints);
router.get('/:id', complaintController.getComplaint);

// Admin only routes
router.get('/', isAdmin, complaintController.getAllComplaints);
router.patch('/:id/status', isAdmin, complaintController.updateComplaintStatus);
router.delete('/:id', isAdmin, complaintController.deleteComplaint);
router.get('/stats/overview', isAdmin, complaintController.getComplaintStats);

module.exports = router;
