const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
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

// Task validation rules
const taskValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Task name is required')
    .isLength({ max: 255 })
    .withMessage('Task name must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  body('stage_id')
    .isInt({ min: 1 })
    .withMessage('Stage ID must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['not-started', 'in-progress', 'under-review', 'completed', 'blocked'])
    .withMessage('Status must be one of: not-started, in-progress, under-review, completed, blocked'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('estimated_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  
  body('component_path')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Component path must not exceed 1000 characters'),
  
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  
  body('assignees.*.id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  
  body('assignees.*.type')
    .optional()
    .isIn(['admin', 'team'])
    .withMessage('Assignee type must be admin or team'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each skill ID must be a positive integer')
];

const taskUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Task name must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('status')
    .optional()
    .isIn(['not-started', 'in-progress', 'under-review', 'completed', 'blocked'])
    .withMessage('Status must be one of: not-started, in-progress, under-review, completed, blocked'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('estimated_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  
  body('actual_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be a positive number'),
  
  body('component_path')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Component path must not exceed 1000 characters'),
  
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  
  body('assignees.*.id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  
  body('assignees.*.type')
    .optional()
    .isIn(['admin', 'team'])
    .withMessage('Assignee type must be admin or team'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each skill ID must be a positive integer')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
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
    .isIn(['name', 'created_at', 'updated_at', 'start_date', 'end_date', 'priority', 'status', 'progress'])
    .withMessage('Sort field must be one of: name, created_at, updated_at, start_date, end_date, priority, status, progress'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  query('status')
    .optional()
    .isIn(['not-started', 'in-progress', 'under-review', 'completed', 'blocked'])
    .withMessage('Status must be one of: not-started, in-progress, under-review, completed, blocked'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  query('assignee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  
  query('assignee_type')
    .optional()
    .isIn(['admin', 'team'])
    .withMessage('Assignee type must be admin or team'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be between 1 and 255 characters')
];

// Routes

// Get all tasks
router.get('/', 
  authenticateToken,
  queryValidation,
  handleValidationErrors,
  getTasks
);

// Get task by ID
router.get('/:id',
  authenticateToken,
  idValidation,
  handleValidationErrors,
  getTask
);

// Create new task
router.post('/',
  authenticateToken,
  taskValidation,
  handleValidationErrors,
  createTask
);

// Update task
router.put('/:id',
  authenticateToken,
  idValidation,
  taskUpdateValidation,
  handleValidationErrors,
  updateTask
);

// Delete task
router.delete('/:id',
  authenticateToken,
  idValidation,
  handleValidationErrors,
  deleteTask
);

module.exports = router;
