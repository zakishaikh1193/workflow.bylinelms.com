const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { requireAdminAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAdminAuth);

// Get all units for a book
router.get('/book/:bookId', unitController.getUnitsByBook);

// Get all units
router.get('/', unitController.getAllUnits);

// Get unit by ID
router.get('/:id', unitController.getUnitById);

// Create new unit
router.post('/', unitController.createUnit);

// Update unit
router.put('/:id', unitController.updateUnit);

// Delete unit
router.delete('/:id', unitController.deleteUnit);

// Auto-distribute weights for units in a book
router.post('/distribute-weights', unitController.distributeWeights);

module.exports = router;
