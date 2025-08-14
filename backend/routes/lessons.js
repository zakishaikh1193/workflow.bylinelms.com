const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { requireAdminAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAdminAuth);

// Get all lessons for a unit
router.get('/unit/:unitId', lessonController.getLessonsByUnit);

// Get all lessons
router.get('/', lessonController.getAllLessons);

// Get lesson by ID
router.get('/:id', lessonController.getLessonById);

// Create new lesson
router.post('/', lessonController.createLesson);

// Update lesson
router.put('/:id', lessonController.updateLesson);

// Delete lesson
router.delete('/:id', lessonController.deleteLesson);

// Auto-distribute weights for lessons in a unit
router.post('/distribute-weights', lessonController.distributeWeights);

module.exports = router;
