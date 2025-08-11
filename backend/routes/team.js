const express = require('express');
const router = express.Router();
const { requireAdminAuth } = require('../middleware/auth');
const {
  // Team member functions (existing)
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  
  // Team management functions (new)
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam
} = require('../controllers/teamController');

// =====================================================
// TEAM MEMBER ROUTES (existing functionality)
// =====================================================

// Get all team members
router.get('/members', requireAdminAuth, getAllTeamMembers);

// Get team member by ID
router.get('/members/:id', requireAdminAuth, getTeamMemberById);

// Create new team member
router.post('/members', requireAdminAuth, createTeamMember);

// Update team member
router.put('/members/:id', requireAdminAuth, updateTeamMember);

// Delete team member
router.delete('/members/:id', requireAdminAuth, deleteTeamMember);

// =====================================================
// TEAM MANAGEMENT ROUTES (new functionality)
// =====================================================

// Get all teams
router.get('/teams', requireAdminAuth, getAllTeams);

// Get team by ID with members
router.get('/teams/:id', requireAdminAuth, getTeamById);

// Create new team
router.post('/teams', requireAdminAuth, createTeam);

// Update team
router.put('/teams/:id', requireAdminAuth, updateTeam);

// Delete team
router.delete('/teams/:id', requireAdminAuth, deleteTeam);

// Add member to team
router.post('/teams/:teamId/members', requireAdminAuth, addMemberToTeam);

// Remove member from team
router.delete('/teams/:teamId/members/:memberId', requireAdminAuth, removeMemberFromTeam);

// =====================================================
// LEGACY ROUTES (for backward compatibility)
// =====================================================

// Get all team members (legacy route)
router.get('/', requireAdminAuth, getAllTeamMembers);

module.exports = router;
