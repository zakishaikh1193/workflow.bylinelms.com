const db = require('../db');

// Get all projects with filters
const getProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'created_at', 
      order = 'desc', 
      search, 
      status, 
      category 
    } = req.query;

    const offset = (page - 1) * limit;
    // Test with simplest possible query first
    const testQuery = 'SELECT COUNT(*) as count FROM projects';
    console.log('🔍 Testing projects table exists...');
    
    try {
      const testResult = await db.query(testQuery);
      console.log('✅ Projects table exists, count:', testResult[0].count);
    } catch (error) {
      console.error('❌ Projects table issue:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Projects table not found or accessible',
        error: error.message
      });
    }

    // Simple query without any parameters first
    let query = 'SELECT * FROM projects ORDER BY created_at DESC LIMIT 20';
    console.log('🔍 Project Query:', query);

    // Execute query
    const rows = await db.query(query);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      countQuery += ` AND p.status = ?`;
      countParams.push(status);
    }

    if (category) {
      countQuery += ` AND p.category_id = ?`;
      countParams.push(category);
    }

    const countResult = await db.query('SELECT COUNT(*) as total FROM projects');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
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
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch projects'
      }
    });
  }
};

// Get project by ID
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const rows = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch project'
      }
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      start_date,
      end_date,
      status = 'planning',
      progress = 0,
      parent_id = null
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project name is required'
        }
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Start date and end date are required'
        }
      });
    }

    const query = `
      INSERT INTO projects (
        name, description, category_id, start_date, end_date, 
        status, progress, created_by, parent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ensure all parameters are defined and properly formatted
    const created_by = req.user?.id || 1; // Fallback to admin user ID 1
    
    // Format dates to MySQL DATE format (YYYY-MM-DD)
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
    };
    
    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);
    
    const params = [
      name || null,
      description || null,
      category_id || null,
      formattedStartDate,
      formattedEndDate,
      status || 'planning',
      progress || 0,
      created_by,
      parent_id || null
    ];

    console.log('🚀 Creating project with formatted values:', {
      name, description, category_id, 
      start_date: formattedStartDate, 
      end_date: formattedEndDate, 
      status, progress, created_by, parent_id
    });
    
    console.log('🔍 SQL Parameters:', params);
    console.log('🔍 Parameter types:', params.map(p => typeof p));

    // Use the fixed db.insert method
    const result = await db.insert(query, params);
    const insertId = result.insertId;

    console.log('✅ Project created with ID:', insertId);

    // Get the created project
    const createdProject = await db.query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [insertId]
    );

    res.status(201).json({
      success: true,
      data: createdProject[0],
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create project'
      }
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category_id,
      start_date,
      end_date,
      status,
      progress,
      parent_id
    } = req.body;

    // Check if project exists
    const existing = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    const query = `
      UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status),
        progress = COALESCE(?, progress),
        parent_id = COALESCE(?, parent_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    console.log('🔄 Updating project with values:', {
      name, description, category_id, start_date, end_date, 
      status, progress, parent_id, id
    });

    await db.query(query, [
      name,
      description,
      category_id,
      start_date,
      end_date,
      status,
      progress,
      parent_id,
      id
    ]);

    // Get updated project
    const updatedProject = await db.query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedProject[0],
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update project'
      }
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existing = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    // Delete project (this will cascade delete related records due to foreign key constraints)
    await db.query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete project'
      }
    });
  }
};

// Get project members
const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        pm.*,
        tm.name,
        tm.email,
        tm.phone,
        tm.avatar_url,
        tm.hourly_rate,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM project_members pm
      JOIN team_members tm ON pm.user_id = tm.id
      LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
      LEFT JOIN skills s ON tms.skill_id = s.id
      WHERE pm.project_id = ?
      GROUP BY pm.id, tm.id
      ORDER BY pm.created_at DESC
    `;

    const rows = await db.query(query, [id]);

    // Convert skills from comma-separated string to array
    const members = rows.map(member => ({
      ...member,
      skills: member.skills ? member.skills.split(',') : []
    }));

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch project members'
      }
    });
  }
};

// Add member to project
const addProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member' } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID is required'
        }
      });
    }

    // Check if project exists
    const project = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (project.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    // Check if user exists
    const [user] = await db.query('SELECT id FROM team_members WHERE id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team member not found'
        }
      });
    }

    // Check if member is already in project
    const [existing] = await db.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'User is already a member of this project'
        }
      });
    }

    // Add member to project
    const [result] = await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [id, user_id, role]
    );

    // Get the created project member with user details
    const [newMember] = await db.query(`
      SELECT 
        pm.*,
        tm.name,
        tm.email,
        tm.phone,
        tm.avatar_url,
        tm.hourly_rate
      FROM project_members pm
      JOIN team_members tm ON pm.user_id = tm.id
      WHERE pm.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newMember[0],
      message: 'Member added to project successfully'
    });

  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to add member to project'
      }
    });
  }
};

// Remove member from project
const removeProjectMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // Check if membership exists
    const [existing] = await db.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, memberId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project membership not found'
        }
      });
    }

    // Remove member from project
    await db.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, memberId]
    );

    res.json({
      success: true,
      message: 'Member removed from project successfully'
    });

  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to remove member from project'
      }
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember
};
