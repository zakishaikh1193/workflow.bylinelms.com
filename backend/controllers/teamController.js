const pool = require('../db');
const bcrypt = require('bcryptjs');

// Get all team members
const getTeamMembers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'created_at', 
      order = 'desc', 
      search, 
      status 
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills,
        COUNT(DISTINCT pm.project_id) as project_count,
        COUNT(DISTINCT ta.task_id) as active_tasks
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      LEFT JOIN project_members pm ON tm.id = pm.user_id
      LEFT JOIN task_assignees ta ON tm.id = ta.user_id
      LEFT JOIN tasks t ON ta.task_id = t.id AND t.status NOT IN ('completed', 'cancelled')
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add filters
    if (search) {
      query += ` AND (tm.name LIKE ? OR tm.email LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    if (status) {
      query += ` AND tm.status = ?`;
      queryParams.push(status);
      paramIndex++;
    }

    query += ` GROUP BY tm.id`;

    // Add sorting
    const validSortFields = ['name', 'email', 'created_at', 'updated_at', 'hourly_rate', 'status'];
    const validOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toLowerCase())) {
      query += ` ORDER BY tm.${sort} ${order.toUpperCase()}`;
    }

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute query
    const [rows] = await pool.execute(query, queryParams);

    // Convert skills from comma-separated string to array
    const teamMembers = rows.map(member => ({
      ...member,
      skills: member.skills ? member.skills.split(',') : []
    }));

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT tm.id) as total
      FROM team_members tm
      WHERE 1=1
    `;

    const countParams = [];

    if (search) {
      countQuery += ` AND (tm.name LIKE ? OR tm.email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      countQuery += ` AND tm.status = ?`;
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: teamMembers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch team members'
      }
    });
  }
};

// Get team member by ID
const getTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        tm.*,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM team_members tm
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      WHERE tm.id = ?
      GROUP BY tm.id
    `;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team member not found'
        }
      });
    }

    const teamMember = {
      ...rows[0],
      skills: rows[0].skills ? rows[0].skills.split(',') : []
    };

    res.json({
      success: true,
      data: teamMember
    });

  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch team member'
      }
    });
  }
};

// Create new team member
const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      passcode,
      hourly_rate,
      avatar_url,
      bio,
      status = 'active',
      skills = []
    } = req.body;

    // Validate required fields
    if (!name || !email || !passcode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and passcode are required'
        }
      });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM team_members WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Email already exists'
        }
      });
    }

    // Hash the passcode
    const hashedPasscode = await bcrypt.hash(passcode, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert team member
      const query = `
        INSERT INTO team_members (
          name, email, phone, passcode_hash, hourly_rate, 
          avatar_url, bio, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        name,
        email,
        phone,
        hashedPasscode,
        hourly_rate,
        avatar_url,
        bio,
        status
      ]);

      const teamMemberId = result.insertId;

      // Add skills if provided
      if (skills && skills.length > 0) {
        for (const skillId of skills) {
          await connection.execute(
            'INSERT INTO team_member_skills (team_member_id, skill_id) VALUES (?, ?)',
            [teamMemberId, skillId]
          );
        }
      }

      await connection.commit();

      // Get the created team member with skills
      const [createdMember] = await pool.execute(`
        SELECT 
          tm.*,
          GROUP_CONCAT(DISTINCT s.name) as skills
        FROM team_members tm
        LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
        LEFT JOIN skills s ON tms.skill_id = s.id
        WHERE tm.id = ?
        GROUP BY tm.id
      `, [teamMemberId]);

      const memberData = {
        ...createdMember[0],
        skills: createdMember[0].skills ? createdMember[0].skills.split(',') : []
      };

      res.status(201).json({
        success: true,
        data: memberData,
        message: 'Team member created successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create team member'
      }
    });
  }
};

// Update team member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      passcode,
      hourly_rate,
      avatar_url,
      bio,
      status,
      skills
    } = req.body;

    // Check if team member exists
    const [existing] = await pool.execute('SELECT id FROM team_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team member not found'
        }
      });
    }

    // If email is being updated, check for duplicates
    if (email) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM team_members WHERE email = ? AND id != ?',
        [email, id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'Email already exists'
          }
        });
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Prepare update query
      let updateQuery = `
        UPDATE team_members SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          hourly_rate = COALESCE(?, hourly_rate),
          avatar_url = COALESCE(?, avatar_url),
          bio = COALESCE(?, bio),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      `;

      let updateParams = [name, email, phone, hourly_rate, avatar_url, bio, status];

      // Hash new passcode if provided
      if (passcode) {
        const hashedPasscode = await bcrypt.hash(passcode, 10);
        updateQuery += `, passcode_hash = ?`;
        updateParams.push(hashedPasscode);
      }

      updateQuery += ` WHERE id = ?`;
      updateParams.push(id);

      await connection.execute(updateQuery, updateParams);

      // Update skills if provided
      if (skills !== undefined) {
        // Remove existing skills
        await connection.execute(
          'DELETE FROM team_member_skills WHERE team_member_id = ?',
          [id]
        );

        // Add new skills
        if (skills.length > 0) {
          for (const skillId of skills) {
            await connection.execute(
              'INSERT INTO team_member_skills (team_member_id, skill_id) VALUES (?, ?)',
              [id, skillId]
            );
          }
        }
      }

      await connection.commit();

      // Get updated team member with skills
      const [updatedMember] = await pool.execute(`
        SELECT 
          tm.*,
          GROUP_CONCAT(DISTINCT s.name) as skills
        FROM team_members tm
        LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
        LEFT JOIN skills s ON tms.skill_id = s.id
        WHERE tm.id = ?
        GROUP BY tm.id
      `, [id]);

      const memberData = {
        ...updatedMember[0],
        skills: updatedMember[0].skills ? updatedMember[0].skills.split(',') : []
      };

      res.json({
        success: true,
        data: memberData,
        message: 'Team member updated successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update team member'
      }
    });
  }
};

// Delete team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team member exists
    const [existing] = await pool.execute('SELECT id FROM team_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team member not found'
        }
      });
    }

    // Check if team member is assigned to any active projects or tasks
    const [assignments] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM project_members WHERE user_id = ?) as project_count,
        (SELECT COUNT(*) FROM task_assignees ta 
         JOIN tasks t ON ta.task_id = t.id 
         WHERE ta.user_id = ? AND t.status NOT IN ('completed', 'cancelled')) as active_task_count
    `, [id, id]);

    if (assignments[0].project_count > 0 || assignments[0].active_task_count > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'MEMBER_HAS_ASSIGNMENTS',
          message: 'Cannot delete team member with active project or task assignments'
        }
      });
    }

    // Delete team member (this will cascade delete related records)
    await pool.execute('DELETE FROM team_members WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });

  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete team member'
      }
    });
  }
};

// Get team member's performance flags
const getTeamMemberFlags = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        pf.*,
        au.name as flagged_by_name
      FROM performance_flags pf
      LEFT JOIN admin_users au ON pf.flagged_by = au.id
      WHERE pf.team_member_id = ?
      ORDER BY pf.created_at DESC
    `;

    const [rows] = await pool.execute(query, [id]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get team member flags error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch performance flags'
      }
    });
  }
};

// Add performance flag
const addPerformanceFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, severity = 'medium' } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Type and description are required'
        }
      });
    }

    // Check if team member exists
    const [member] = await pool.execute('SELECT id FROM team_members WHERE id = ?', [id]);
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team member not found'
        }
      });
    }

    const query = `
      INSERT INTO performance_flags (team_member_id, type, description, severity, flagged_by)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [id, type, description, severity, req.user.id]);

    // Get the created flag with admin details
    const [newFlag] = await pool.execute(`
      SELECT 
        pf.*,
        au.name as flagged_by_name
      FROM performance_flags pf
      LEFT JOIN admin_users au ON pf.flagged_by = au.id
      WHERE pf.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newFlag[0],
      message: 'Performance flag added successfully'
    });

  } catch (error) {
    console.error('Add performance flag error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to add performance flag'
      }
    });
  }
};

// Remove performance flag
const removePerformanceFlag = async (req, res) => {
  try {
    const { flagId } = req.params;

    // Check if flag exists
    const [existing] = await pool.execute('SELECT id FROM performance_flags WHERE id = ?', [flagId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Performance flag not found'
        }
      });
    }

    await pool.execute('DELETE FROM performance_flags WHERE id = ?', [flagId]);

    res.json({
      success: true,
      message: 'Performance flag removed successfully'
    });

  } catch (error) {
    console.error('Remove performance flag error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to remove performance flag'
      }
    });
  }
};

module.exports = {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamMemberFlags,
  addPerformanceFlag,
  removePerformanceFlag
};
