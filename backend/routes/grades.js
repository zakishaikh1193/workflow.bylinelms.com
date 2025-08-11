const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { requireAdminAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAdminAuth);

// Get all grades for a project
router.get('/project/:projectId', gradeController.getGradesByProject);

// Get all grades
router.get('/', gradeController.getAllGrades);

// Get grade by ID
router.get('/:id', gradeController.getGradeById);

// Create new grade
router.post('/', gradeController.createGrade);

// Update grade
router.put('/:id', gradeController.updateGrade);

// Delete grade
router.delete('/:id', gradeController.deleteGrade);

// Auto-distribute weights for grades in a project
router.post('/distribute-weights', gradeController.distributeWeights);

module.exports = router;
