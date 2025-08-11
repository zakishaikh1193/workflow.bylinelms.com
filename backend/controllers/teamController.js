const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all team members (existing functionality)
const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await db.query(`
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills,
        COUNT(DISTINCT pf.id) as performance_flags_count,
        GROUP_CONCAT(DISTINCT t.name) as team_names,
        GROUP_CONCAT(DISTINCT t.id) as team_ids
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      LEFT JOIN performance_flags pf ON tm.id = pf.team_member_id
      LEFT JOIN team_members_teams tmt ON tm.id = tmt.team_member_id AND tmt.is_active = 1
      LEFT JOIN teams t ON tmt.team_id = t.id AND t.is_active = 1
      WHERE tm.is_active = true
      GROUP BY tm.id
      ORDER BY tm.name
    `);

    // Parse skills string into array and add team information
    const formattedTeamMembers = teamMembers.map(member => ({
      ...member,
      skills: member.skills ? member.skills.split(',') : [],
      team_names: member.team_names ? member.team_names.split(',') : [],
      team_ids: member.team_ids ? member.team_ids.split(',').map(id => parseInt(id)) : []
    }));

    res.json({
      success: true,
      data: formattedTeamMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch team members' }
    });
  }
};

// Get team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMembers = await db.query(`
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills,
        GROUP_CONCAT(DISTINCT pf.type) as performance_flags,
        GROUP_CONCAT(DISTINCT t.name) as team_names,
        GROUP_CONCAT(DISTINCT t.id) as team_ids
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      LEFT JOIN performance_flags pf ON tm.id = pf.team_member_id
      LEFT JOIN team_members_teams tmt ON tm.id = tmt.team_member_id AND tmt.is_active = 1
      LEFT JOIN teams t ON tmt.team_id = t.id AND t.is_active = 1
      WHERE tm.id = ? AND tm.is_active = true
      GROUP BY tm.id
    `, [id]);

    if (teamMembers.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team member not found' }
      });
    }

    const member = teamMembers[0];
    member.skills = member.skills ? member.skills.split(',') : [];
    member.performance_flags = member.performance_flags ? member.performance_flags.split(',') : [];
    member.team_names = member.team_names ? member.team_names.split(',') : [];
    member.team_ids = member.team_ids ? member.team_ids.split(',').map(id => parseInt(id)) : [];

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch team member' }
    });
  }
};

// Create team member
const createTeamMember = async (req, res) => {
  try {
    const { name, email, passcode, skills, team_id } = req.body;

    // Validate required fields
    if (!name || !email || !passcode) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name, email, and passcode are required' }
      });
    }

    // Check if email already exists
    const existingMembers = await db.query(
      'SELECT id FROM team_members WHERE email = ?',
      [email]
    );

    if (existingMembers.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email already exists' }
      });
    }

    // Insert team member
    const result = await db.insert(
      'INSERT INTO team_members (name, email, passcode) VALUES (?, ?, ?)',
      [name, email, passcode]
    );

    const teamMemberId = result.insertId;

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        // Get or create skill
        let skillResult = await db.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        let skillId;
        if (skillResult.length === 0) {
          // Create new skill
          const newSkillResult = await db.insert(
            'INSERT INTO skills (name, description) VALUES (?, ?)',
            [skillName, `Skill for ${skillName}`]
          );
          skillId = newSkillResult.insertId;
        } else {
          skillId = skillResult[0].id;
        }

        // Add skill to team member
        await db.execute(
          'INSERT INTO team_member_skills (team_member_id, skill_id) VALUES (?, ?)',
          [teamMemberId, skillId]
        );
      }
    }

    // Add to team if team_id is provided
    if (team_id) {
      await db.execute(
        'INSERT INTO team_members_teams (team_id, team_member_id, role, joined_date) VALUES (?, ?, ?, NOW())',
        [team_id, teamMemberId, 'member']
      );
    }

    // Get created team member with skills
    const createdMember = await db.query(`
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      WHERE tm.id = ?
      GROUP BY tm.id
    `, [teamMemberId]);

    const member = createdMember[0];
    member.skills = member.skills ? member.skills.split(',') : [];

    res.status(201).json({
      success: true,
      data: member,
      message: 'Team member created successfully'
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create team member' }
    });
  }
};

// Update team member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, passcode, skills, is_active, team_id } = req.body;

    // Check if team member exists
    const existingMember = await db.query(
      'SELECT id FROM team_members WHERE id = ?',
      [id]
    );

    if (existingMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team member not found' }
      });
    }

    // Update basic info
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (passcode !== undefined) {
      updateFields.push('passcode = ?');
      updateValues.push(passcode);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.execute(
        `UPDATE team_members SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update skills if provided
    if (skills !== undefined) {
      // Remove existing skills
      await db.execute(
        'DELETE FROM team_member_skills WHERE team_member_id = ?',
        [id]
      );

      // Add new skills
      if (Array.isArray(skills) && skills.length > 0) {
        for (const skillName of skills) {
          // Get or create skill
          let skillResult = await db.query(
            'SELECT id FROM skills WHERE name = ?',
            [skillName]
          );

          let skillId;
          if (skillResult.length === 0) {
            // Create new skill
            const newSkillResult = await db.insert(
              'INSERT INTO skills (name, description) VALUES (?, ?)',
              [skillName, `Skill for ${skillName}`]
            );
            skillId = newSkillResult.insertId;
          } else {
            skillId = skillResult[0].id;
          }

          // Add skill to team member
          await db.execute(
            'INSERT INTO team_member_skills (team_member_id, skill_id) VALUES (?, ?)',
            [id, skillId]
          );
        }
      }
    }

    // Update team assignment if provided
    if (team_id !== undefined) {
      // Remove existing team assignments
      await db.execute(
        'DELETE FROM team_members_teams WHERE team_member_id = ?',
        [id]
      );

      // Add new team assignment if team_id is provided
      if (team_id) {
        await db.execute(
          'INSERT INTO team_members_teams (team_id, team_member_id, role, joined_date) VALUES (?, ?, ?, NOW())',
          [team_id, id, 'member']
        );
      }
    }

    // Get updated team member
    const updatedMember = await db.query(`
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      WHERE tm.id = ?
      GROUP BY tm.id
    `, [id]);

    const member = updatedMember[0];
    member.skills = member.skills ? member.skills.split(',') : [];

    res.json({
      success: true,
      data: member,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update team member' }
    });
  }
};

// Delete team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team member exists
    const existingMember = await db.query(
      'SELECT id FROM team_members WHERE id = ?',
      [id]
    );

    if (existingMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team member not found' }
      });
    }

    // Soft delete by setting is_active to false
    await db.execute(
      'UPDATE team_members SET is_active = false WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete team member' }
    });
  }
};

// =====================================================
// TEAM MANAGEMENT FUNCTIONS (NEW)
// =====================================================

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await db.query(`
      SELECT 
        t.*,
        fu.name as functional_unit_name,
        CONCAT(tm.name, ' (', t.team_lead_type, ')') as team_lead_name,
        COUNT(DISTINCT tmt.team_member_id) as member_count,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM teams t
      LEFT JOIN functional_units fu ON t.functional_unit_id = fu.id
      LEFT JOIN team_members tm ON t.team_lead_id = tm.id AND t.team_lead_type = 'team'
      LEFT JOIN admin_users au ON t.team_lead_id = au.id AND t.team_lead_type = 'admin'
      LEFT JOIN team_members_teams tmt ON t.id = tmt.team_id AND tmt.is_active = true
      LEFT JOIN team_skills ts ON t.id = ts.team_id
      LEFT JOIN skills s ON ts.skill_id = s.id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.name
    `);

    // Parse skills string into array
    const formattedTeams = teams.map(team => ({
      ...team,
      skills: team.skills ? team.skills.split(',') : [],
      team_lead_name: team.team_lead_name || 'Unassigned'
    }));

    res.json({
      success: true,
      data: formattedTeams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch teams' }
    });
  }
};

// Get team by ID with members
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get team details
    const teams = await db.query(`
      SELECT 
        t.*,
        fu.name as functional_unit_name,
        CONCAT(tm.name, ' (', t.team_lead_type, ')') as team_lead_name
      FROM teams t
      LEFT JOIN functional_units fu ON t.functional_unit_id = fu.id
      LEFT JOIN team_members tm ON t.team_lead_id = tm.id AND t.team_lead_type = 'team'
      LEFT JOIN admin_users au ON t.team_lead_id = au.id AND t.team_lead_type = 'admin'
      WHERE t.id = ? AND t.is_active = true
    `, [id]);

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    const team = teams[0];
    team.team_lead_name = team.team_lead_name || 'Unassigned';

    // Get team members
    const members = await db.query(`
      SELECT 
        tm.*,
        tmt.role as team_role,
        tmt.joined_date,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM team_members_teams tmt
      JOIN team_members tm ON tmt.team_member_id = tm.id
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      WHERE tmt.team_id = ? AND tmt.is_active = true AND tm.is_active = true
      GROUP BY tm.id
      ORDER BY tmt.role DESC, tm.name
    `, [id]);

    // Get team skills
    const skills = await db.query(`
      SELECT 
        s.name,
        ts.proficiency_level
      FROM team_skills ts
      JOIN skills s ON ts.skill_id = s.id
      WHERE ts.team_id = ?
      ORDER BY ts.proficiency_level DESC, s.name
    `, [id]);

    // Format members
    const formattedMembers = members.map(member => ({
      ...member,
      skills: member.skills ? member.skills.split(',') : []
    }));

    res.json({
      success: true,
      data: {
        ...team,
        members: formattedMembers,
        skills: skills
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch team' }
    });
  }
};

// Create team
const createTeam = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      functional_unit_id, 
      team_lead_id, 
      team_lead_type, 
      max_capacity,
      skills,
      members 
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Team name is required' }
      });
    }



    // Check if team name already exists
    const existingTeams = await db.query(
      'SELECT id FROM teams WHERE name = ? AND is_active = true',
      [name]
    );

    if (existingTeams.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Team name already exists' }
      });
    }

    // Insert team
    const result = await db.insert(
      `INSERT INTO teams (name, description, functional_unit_id, team_lead_id, team_lead_type, max_capacity) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, functional_unit_id, team_lead_id, team_lead_type, max_capacity || 10]
    );

    const teamId = result.insertId;

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillData of skills) {
        const skillName = typeof skillData === 'string' ? skillData : skillData.name;
        const proficiencyLevel = skillData.proficiency_level || 'intermediate';

        // Get or create skill
        let skillResult = await db.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        let skillId;
        if (skillResult.length === 0) {
          // Create new skill
          const newSkillResult = await db.insert(
            'INSERT INTO skills (name, description) VALUES (?, ?)',
            [skillName, `Skill for ${skillName}`]
          );
          skillId = newSkillResult.insertId;
        } else {
          skillId = skillResult[0].id;
        }

        // Add skill to team
        await db.execute(
          'INSERT INTO team_skills (team_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
          [teamId, skillId, proficiencyLevel]
        );
      }
    }

    // Add members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      for (const memberData of members) {
        const memberId = memberData.member_id || memberData.id;
        const role = memberData.role || 'member';
        const joinedDate = memberData.joined_date || new Date().toISOString().split('T')[0];

        await db.execute(
          'INSERT INTO team_members_teams (team_id, team_member_id, role, joined_date) VALUES (?, ?, ?, ?)',
          [teamId, memberId, role, joinedDate]
        );
      }
    }

    // Get created team
    const createdTeam = await db.query(`
      SELECT 
        t.*,
        fu.name as functional_unit_name,
        CONCAT(tm.name, ' (', t.team_lead_type, ')') as team_lead_name
      FROM teams t
      LEFT JOIN functional_units fu ON t.functional_unit_id = fu.id
      LEFT JOIN team_members tm ON t.team_lead_id = tm.id AND t.team_lead_type = 'team'
      LEFT JOIN admin_users au ON t.team_lead_id = au.id AND t.team_lead_type = 'admin'
      WHERE t.id = ?
    `, [teamId]);

    const team = createdTeam[0];
    team.team_lead_name = team.team_lead_name || 'Unassigned';

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Failed to create team',
        details: error.message 
      }
    });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      functional_unit_id, 
      team_lead_id, 
      team_lead_type, 
      max_capacity,
      is_active 
    } = req.body;

    // Check if team exists
    const existingTeam = await db.query(
      'SELECT id FROM teams WHERE id = ?',
      [id]
    );

    if (existingTeam.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    // Update team
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (functional_unit_id !== undefined) {
      updateFields.push('functional_unit_id = ?');
      updateValues.push(functional_unit_id);
    }
    if (team_lead_id !== undefined) {
      updateFields.push('team_lead_id = ?');
      updateValues.push(team_lead_id);
    }
    if (team_lead_type !== undefined) {
      updateFields.push('team_lead_type = ?');
      updateValues.push(team_lead_type);
    }
    if (max_capacity !== undefined) {
      updateFields.push('max_capacity = ?');
      updateValues.push(max_capacity);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.execute(
        `UPDATE teams SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Get updated team
    const updatedTeam = await db.query(`
      SELECT 
        t.*,
        fu.name as functional_unit_name,
        CONCAT(tm.name, ' (', t.team_lead_type, ')') as team_lead_name
      FROM teams t
      LEFT JOIN functional_units fu ON t.functional_unit_id = fu.id
      LEFT JOIN team_members tm ON t.team_lead_id = tm.id AND t.team_lead_type = 'team'
      LEFT JOIN admin_users au ON t.team_lead_id = au.id AND t.team_lead_type = 'admin'
      WHERE t.id = ?
    `, [id]);

    const team = updatedTeam[0];
    team.team_lead_name = team.team_lead_name || 'Unassigned';

    res.json({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update team' }
    });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
    const existingTeam = await db.query(
      'SELECT id FROM teams WHERE id = ?',
      [id]
    );

    if (existingTeam.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    // Soft delete by setting is_active to false
    await db.execute(
      'UPDATE teams SET is_active = false WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete team' }
    });
  }
};

// Add member to team
const addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { member_id, role, joined_date } = req.body;

    // Validate required fields
    if (!member_id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Member ID is required' }
      });
    }

    // Check if team exists
    const existingTeam = await db.query(
      'SELECT id FROM teams WHERE id = ? AND is_active = true',
      [teamId]
    );

    if (existingTeam.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    // Check if member exists
    const existingMember = await db.query(
      'SELECT id FROM team_members WHERE id = ? AND is_active = true',
      [member_id]
    );

    if (existingMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team member not found' }
      });
    }

    // Check if member is already in team
    const existingAssignment = await db.query(
      'SELECT id FROM team_members_teams WHERE team_id = ? AND team_member_id = ?',
      [teamId, member_id]
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Member is already in this team' }
      });
    }

    // Add member to team
    await db.execute(
      'INSERT INTO team_members_teams (team_id, team_member_id, role, joined_date) VALUES (?, ?, ?, ?)',
      [teamId, member_id, role || 'member', joined_date || new Date().toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      message: 'Member added to team successfully'
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add member to team' }
    });
  }
};

// Remove member from team
const removeMemberFromTeam = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    // Check if assignment exists
    const existingAssignment = await db.query(
      'SELECT id FROM team_members_teams WHERE team_id = ? AND team_member_id = ?',
      [teamId, memberId]
    );

    if (existingAssignment.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Member is not in this team' }
      });
    }

    // Remove member from team (soft delete)
    await db.execute(
      'UPDATE team_members_teams SET is_active = false WHERE team_id = ? AND team_member_id = ?',
      [teamId, memberId]
    );

    res.json({
      success: true,
      message: 'Member removed from team successfully'
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to remove member from team' }
    });
  }
};

module.exports = {
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
};
