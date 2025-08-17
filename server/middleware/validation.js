const validateRegistration = (req, res, next) => {
  console.log('🔍 Validation middleware - Request body:', req.body);
  console.log('🔍 Validation middleware - Request headers:', req.headers);
  console.log('🔍 Validation middleware - Request method:', req.method);
  console.log('🔍 Validation middleware - Content-Type:', req.get('Content-Type'));
  
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    console.log('❌ Validation failed - missing required fields');
    console.log('❌ Received data:', { firstName, lastName, email, password: password ? '[HIDDEN]' : undefined, phoneNumber });
    return res.status(400).json({
      status: 'error',
      message: 'First name, last name, email, and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid email address'
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long'
    });
  }

  // Validate name length
  if (firstName.length > 50 || lastName.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'First name and last name cannot exceed 50 characters'
    });
  }

  // Validate phone number if provided
  if (phoneNumber) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid phone number'
      });
    }
  }

  console.log('✅ Validation passed');
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid email address'
    });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, phoneNumber } = req.body;

  if (firstName && firstName.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'First name cannot exceed 50 characters'
    });
  }

  if (lastName && lastName.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Last name cannot exceed 50 characters'
    });
  }

  if (phoneNumber) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid phone number'
      });
    }
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'New password must be at least 6 characters long'
    });
  }

  next();
};

const validateComplaint = (req, res, next) => {
  const { title, description, category, priority, tags } = req.body;

  // Check required fields
  if (!title || !description || !category || !priority) {
    return res.status(400).json({
      status: 'error',
      message: 'Title, description, category, and priority are required'
    });
  }

  // Validate title length
  if (title.length < 5 || title.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Title must be between 5 and 100 characters'
    });
  }

  // Validate description length
  if (description.length < 10 || description.length > 1000) {
    return res.status(400).json({
      status: 'error',
      message: 'Description must be between 10 and 1000 characters'
    });
  }

  // Validate category
  const validCategories = ['technical', 'billing', 'service', 'product', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid category. Must be one of: technical, billing, service, product, other'
    });
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid priority. Must be one of: low, medium, high, urgent'
    });
  }

  // Validate tags if provided
  if (tags && Array.isArray(tags)) {
    if (tags.length > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 10 tags allowed'
      });
    }
    
    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.length > 20) {
        return res.status(400).json({
          status: 'error',
          message: 'Each tag must be a string with maximum 20 characters'
        });
      }
    }
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateComplaint
};
