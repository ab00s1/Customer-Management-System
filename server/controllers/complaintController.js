const nodemailer = require('nodemailer');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email to admins when a new complaint is created
async function notifyAdminsNewComplaint(complaint) {
  const admins = await User.find({ role: 'admin' });
  const adminEmails = admins.map(admin => admin.email);

  await transporter.sendMail({
    from: `"Complaint App" <${process.env.EMAIL_USER}>`,
    to: adminEmails,
    subject: 'New Complaint Submitted',
    text: `A new complaint has been submitted by ${complaint.submittedBy.firstName}.\nTitle: ${complaint.title}\nDescription: ${complaint.description}`
  });
}

// Send email to user when complaint is resolved
async function notifyUserResolved(complaint) {
  const user = await User.findById(complaint.submittedBy);
  await transporter.sendMail({
    from: `"Complaint App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Your Complaint Has Been Resolved',
    text: `Your complaint "${complaint.title}" has been marked as resolved by the admin.`
  });
}


// Create new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, tags } = req.body;
    
    // Create new complaint
    const newComplaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      tags: tags || [],
      submittedBy: req.user._id,
      isUrgent: priority === 'urgent'
    });

    // Populate user details
    await newComplaint.populate('submittedBy', 'firstName lastName email');

    await notifyAdminsNewComplaint(newComplaint);

    res.status(201).json({
      status: 'success',
      message: 'Complaint submitted successfully',
      data: {
        complaint: newComplaint
      }
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating complaint',
      error: error.message
    });
  }
};

// Get all complaints (admin only)
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints with pagination
    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Complaint.countDocuments(filter);

    // Get statistics
    const stats = await Complaint.getStats();

    res.status(200).json({
      status: 'success',
      data: {
        complaints,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// Get user's own complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category
    } = req.query;

    // Build filter object
    const filter = { submittedBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints
    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        complaints,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// Get single complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Complaint not found'
      });
    }

    // Check if user can access this complaint
    if (req.user.role !== 'admin' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        complaint
      }
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// Update complaint status (admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes, estimatedResolutionTime } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Complaint not found'
      });
    }

    // Update fields
    if (status) complaint.status = status;
    if (assignedTo) {
      complaint.assignedTo = assignedTo;
      if (status === 'in-progress') {
        complaint.assignedAt = new Date();
      }
    }
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (estimatedResolutionTime) complaint.estimatedResolutionTime = estimatedResolutionTime;

    // Update timestamps
    if (status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    if (complaint.status === 'resolved') {
      await notifyUserResolved(complaint);
    }

    await complaint.save();
    
    // Populate user details
    await complaint.populate('submittedBy', 'firstName lastName email');
    await complaint.populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Complaint updated successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

// Delete complaint (admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Complaint not found'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

// Get complaint statistics (admin only)
exports.getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.getStats();
    
    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get complaints by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get complaints by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        recentComplaints,
        categoryStats,
        priorityStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
