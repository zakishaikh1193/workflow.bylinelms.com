const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireAdminAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAdminAuth);

// Get all books for a grade
router.get('/grade/:gradeId', bookController.getBooksByGrade);

// Get all books
router.get('/', bookController.getAllBooks);

// Get book by ID
router.get('/:id', bookController.getBookById);

// Create new book
router.post('/', bookController.createBook);

// Update book
router.put('/:id', bookController.updateBook);

// Delete book
router.delete('/:id', bookController.deleteBook);

// Auto-distribute weights for books in a grade
router.post('/distribute-weights', bookController.distributeWeights);

module.exports = router;
