const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamMemberFlags,
  addPerformanceFlag,
  removePerformanceFlag
} = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

// Team member validation rules
const teamMemberValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  
  body('passcode')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Passcode must be at least 4 characters long'),
  
  body('hourly_rate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (typeof value === 'number' && value >= 0) {
        return true; // Allow positive numbers
      }
      throw new Error('Hourly rate must be a positive number or null');
    }),
  
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on-leave'])
    .withMessage('Status must be one of: active, inactive, on-leave'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each skill ID must be a positive integer')
];

const teamMemberUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  
  body('passcode')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Passcode must be at least 4 characters long'),
  
  body('hourly_rate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (typeof value === 'number' && value >= 0) {
        return true; // Allow positive numbers
      }
      throw new Error('Hourly rate must be a positive number or null');
    }),
  
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on-leave'])
    .withMessage('Status must be one of: active, inactive, on-leave'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each skill ID must be a positive integer')
];

const performanceFlagValidation = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Flag type is required')
    .isLength({ max: 100 })
    .withMessage('Flag type must not exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severity must be one of: low, medium, high, critical')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

const flagIdValidation = [
  param('flagId')
    .isInt({ min: 1 })
    .withMessage('Flag ID must be a positive integer')
];

// Query validation for filtering
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['name', 'email', 'created_at', 'updated_at', 'hourly_rate', 'status'])
    .withMessage('Sort field must be one of: name, email, created_at, updated_at, hourly_rate, status'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'on-leave'])
    .withMessage('Status must be one of: active, inactive, on-leave')
];

// Routes

// Get all team members
router.get('/', 
  authenticateToken,
  queryValidation,
  handleValidationErrors,
  getTeamMembers
);

// Get team member by ID
router.get('/:id',
  authenticateToken,
  idValidation,
  handleValidationErrors,
  getTeamMember
);

// Create new team member
router.post('/',
  authenticateToken,
  teamMemberValidation,
  handleValidationErrors,
  createTeamMember
);

// Update team member
router.put('/:id',
  authenticateToken,
  idValidation,
  teamMemberUpdateValidation,
  handleValidationErrors,
  updateTeamMember
);

// Delete team member
router.delete('/:id',
  authenticateToken,
  idValidation,
  handleValidationErrors,
  deleteTeamMember
);

// Get team member performance flags
router.get('/:id/flags',
  authenticateToken,
  idValidation,
  handleValidationErrors,
  getTeamMemberFlags
);

// Add performance flag
router.post('/:id/flags',
  authenticateToken,
  idValidation,
  performanceFlagValidation,
  handleValidationErrors,
  addPerformanceFlag
);

// Remove performance flag (note: different from team member routes)
router.delete('/flags/:flagId',
  authenticateToken,
  flagIdValidation,
  handleValidationErrors,
  removePerformanceFlag
);

module.exports = router;
