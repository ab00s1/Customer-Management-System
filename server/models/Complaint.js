const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: ['technical', 'billing', 'service', 'product', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    required: [true, 'Complaint priority is required'],
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: [true, 'Complaint status is required'],
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Complaint must be submitted by a user']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  estimatedResolutionTime: {
    type: Number, // in hours
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for complaint age
complaintSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for status color
complaintSchema.virtual('statusColor').get(function() {
  const colors = {
    'pending': 'yellow',
    'in-progress': 'blue',
    'resolved': 'green',
    'closed': 'gray'
  };
  return colors[this.status] || 'gray';
});

// Virtual for priority color
complaintSchema.virtual('priorityColor').get(function() {
  const colors = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'orange',
    'urgent': 'red'
  };
  return colors[this.priority] || 'yellow';
});

// Indexes for better query performance
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
complaintSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'in-progress' && !this.assignedAt) {
      this.assignedAt = new Date();
    }
  }
  next();
});

// Static method to get complaint statistics
complaintSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0
  };
};

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
