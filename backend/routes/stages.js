const express = require('express');
const router = express.Router();
const {
  getStages,
  getStage,
  createStage
} = require('../controllers/stageController');
const { requireAuth } = require('../middleware/auth');
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

const stageValidation = [
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Stage name is required')
    .isLength({ max: 255 })
    .withMessage('Stage name must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('order_index')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Weight must be between 0 and 100'),
  
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

const queryValidation = [
  query('project_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

// Routes

// Get all stages
router.get('/', 
  requireAuth,
  queryValidation,
  handleValidationErrors,
  getStages
);

// Get stage by ID
router.get('/:id',
  requireAuth,
  idValidation,
  handleValidationErrors,
  getStage
);

// Create new stage
router.post('/',
  requireAuth,
  stageValidation,
  handleValidationErrors,
  createStage
);

module.exports = router;
