const db = require('../db');

// Get all allocations with filters
const getAllocations = async (req, res) => {
  try {
    const { 
      user_id,
      user_type,
      project_id,
      task_id,
      start_date,
      end_date,
      date
    } = req.query;

    let query = `
      SELECT 
        ta.*,
        p.name as project_name,
        t.name as task_name,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.name
          WHEN ta.user_type = 'team' THEN tm.name
        END as user_name,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.email
          WHEN ta.user_type = 'team' THEN tm.email
        END as user_email
      FROM team_allocations ta
      LEFT JOIN projects p ON ta.project_id = p.id
      LEFT JOIN tasks t ON ta.task_id = t.id
      LEFT JOIN admin_users au ON ta.user_id = au.id AND ta.user_type = 'admin'
      LEFT JOIN team_members tm ON ta.user_id = tm.id AND ta.user_type = 'team'
      WHERE 1=1
    `;
    
    const queryParams = [];

    if (user_id) {
      query += ' AND ta.user_id = ?';
      queryParams.push(user_id);
    }

    if (user_type) {
      query += ' AND ta.user_type = ?';
      queryParams.push(user_type);
    }

    if (project_id) {
      query += ' AND ta.project_id = ?';
      queryParams.push(project_id);
    }

    if (task_id) {
      query += ' AND ta.task_id = ?';
      queryParams.push(task_id);
    }

    if (start_date) {
      query += ' AND ta.start_date >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ' AND ta.end_date <= ?';
      queryParams.push(end_date);
    }

    if (date) {
      query += ' AND ? BETWEEN ta.start_date AND ta.end_date';
      queryParams.push(date);
    }

    query += ' ORDER BY ta.start_date ASC, ta.user_id ASC';

    console.log('🔍 Allocation query:', query);
    console.log('🔍 Allocation params:', queryParams);

    const allocations = await db.query(query, queryParams);

    res.json({
      success: true,
      data: allocations
    });

  } catch (error) {
    console.error('Get allocations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch allocations'
      }
    });
  }
};

// Get allocation by ID
const getAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ta.*,
        p.name as project_name,
        t.name as task_name,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.name
          WHEN ta.user_type = 'team' THEN tm.name
        END as user_name,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.email
          WHEN ta.user_type = 'team' THEN tm.email
        END as user_email
      FROM team_allocations ta
      LEFT JOIN projects p ON ta.project_id = p.id
      LEFT JOIN tasks t ON ta.task_id = t.id
      LEFT JOIN admin_users au ON ta.user_id = au.id AND ta.user_type = 'admin'
      LEFT JOIN team_members tm ON ta.user_id = tm.id AND ta.user_type = 'team'
      WHERE ta.id = ?
    `;

    const allocations = await db.query(query, [id]);

    if (allocations.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Allocation not found'
        }
      });
    }

    res.json({
      success: true,
      data: allocations[0]
    });

  } catch (error) {
    console.error('Get allocation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch allocation'
      }
    });
  }
};

// Create new allocation
const createAllocation = async (req, res) => {
  try {
    const {
      user_id,
      user_type,
      project_id,
      task_id,
      hours_per_day = 8.00,
      start_date,
      end_date
    } = req.body;

    // Validate required fields
    if (!user_id || !project_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: user_id, project_id, start_date, end_date'
        }
      });
    }

    // Validate user exists - check both admin_users and team_members tables
    let userExists = await db.query('SELECT id FROM admin_users WHERE id = ?', [user_id]);
    let finalUserType = user_type; // Use a local variable instead of reassigning the const
    
    if (userExists.length === 0) {
      // If not found in admin_users, check team_members
      userExists = await db.query('SELECT id FROM team_members WHERE id = ?', [user_id]);
      if (userExists.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `User with ID ${user_id} not found in either admin_users or team_members tables`
          }
        });
      } else {
        // User found in team_members, set user_type to 'team'
        finalUserType = 'team';
      }
    } else {
      // User found in admin_users, set user_type to 'admin'
      finalUserType = 'admin';
    }

    // Validate project exists
    const projectExists = await db.query('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projectExists.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Project with ID ${project_id} not found`
        }
      });
    }

    // Validate task exists if provided
    if (task_id) {
      const taskExists = await db.query('SELECT id FROM tasks WHERE id = ?', [task_id]);
      if (taskExists.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Task with ID ${task_id} not found`
          }
        });
      }
    }

    // Format dates
    const formattedStartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(end_date).toISOString().split('T')[0];

    // Create the allocation
    const insertQuery = `
      INSERT INTO team_allocations (
        user_id, user_type, project_id, task_id, hours_per_day, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      user_id,
      finalUserType,
      project_id,
      task_id || null,
      parseFloat(hours_per_day) || 8.00,
      formattedStartDate,
      formattedEndDate
    ];

    console.log('🚀 Creating allocation with params:', insertParams);

    const result = await db.insert(insertQuery, insertParams);
    const allocationId = result.insertId;

    // Get the created allocation with all related data
    const createdAllocation = await getAllocationById(allocationId);

    console.log('✅ Allocation created with ID:', allocationId);

    res.status(201).json({
      success: true,
      data: createdAllocation,
      message: 'Allocation created successfully'
    });

  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create allocation'
      }
    });
  }
};

// Update allocation
const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      user_type,
      project_id,
      task_id,
      hours_per_day,
      start_date,
      end_date
    } = req.body;

    // Check if allocation exists
    const existing = await db.query('SELECT id FROM team_allocations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Allocation not found'
        }
      });
    }

    // Build update query dynamically for provided fields
    let updateQuery = 'UPDATE team_allocations SET updated_at = CURRENT_TIMESTAMP';
    const updateParams = [];

    if (user_id !== undefined) {
      updateQuery += ', user_id = ?';
      updateParams.push(user_id);
    }
    if (user_type !== undefined) {
      updateQuery += ', user_type = ?';
      updateParams.push(user_type);
    }
    if (project_id !== undefined) {
      updateQuery += ', project_id = ?';
      updateParams.push(project_id);
    }
    if (task_id !== undefined) {
      updateQuery += ', task_id = ?';
      updateParams.push(task_id);
    }
    if (hours_per_day !== undefined) {
      updateQuery += ', hours_per_day = ?';
      updateParams.push(parseFloat(hours_per_day) || 8.00);
    }
    if (start_date !== undefined) {
      updateQuery += ', start_date = ?';
      updateParams.push(new Date(start_date).toISOString().split('T')[0]);
    }
    if (end_date !== undefined) {
      updateQuery += ', end_date = ?';
      updateParams.push(new Date(end_date).toISOString().split('T')[0]);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    await db.query(updateQuery, updateParams);

    // Get updated allocation
    const updatedAllocation = await getAllocationById(id);

    res.json({
      success: true,
      data: updatedAllocation,
      message: 'Allocation updated successfully'
    });

  } catch (error) {
    console.error('Update allocation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update allocation'
      }
    });
  }
};

// Delete allocation
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if allocation exists
    const existing = await db.query('SELECT id FROM team_allocations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Allocation not found'
        }
      });
    }

    // Delete allocation
    await db.query('DELETE FROM team_allocations WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Allocation deleted successfully'
    });

  } catch (error) {
    console.error('Delete allocation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete allocation'
      }
    });
  }
};

// Get workload summary for a specific date
const getWorkloadSummary = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date parameter is required'
        }
      });
    }

    // Get all allocations for the date
    const query = `
      SELECT 
        ta.user_id,
        ta.user_type,
        ta.hours_per_day,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.name
          WHEN ta.user_type = 'team' THEN tm.name
        END as user_name,
        CASE 
          WHEN ta.user_type = 'admin' THEN au.email
          WHEN ta.user_type = 'team' THEN tm.email
        END as user_email
      FROM team_allocations ta
      LEFT JOIN admin_users au ON ta.user_id = au.id AND ta.user_type = 'admin'
      LEFT JOIN team_members tm ON ta.user_id = tm.id AND ta.user_type = 'team'
      WHERE ? BETWEEN ta.start_date AND ta.end_date
    `;

    const allocations = await db.query(query, [date]);

    // Calculate workload status for each user
    const workloadSummary = {};
    
    allocations.forEach(allocation => {
      const userId = `${allocation.user_type}_${allocation.user_id}`;
      
      if (!workloadSummary[userId]) {
        workloadSummary[userId] = {
          user_id: allocation.user_id,
          user_type: allocation.user_type,
          user_name: allocation.user_name,
          user_email: allocation.user_email,
          total_hours: 0,
          allocation_count: 0,
          status: 'available'
        };
      }
      
      workloadSummary[userId].total_hours += parseFloat(allocation.hours_per_day) || 0;
      workloadSummary[userId].allocation_count += 1;
    });

    // Determine status for each user
    Object.values(workloadSummary).forEach(user => {
      if (user.total_hours === 0) {
        user.status = 'available';
      } else if (user.total_hours > 8) {
        user.status = 'overloaded';
      } else if (user.total_hours >= 6) {
        user.status = 'busy';
      } else {
        user.status = 'normal';
      }
    });

    // Get counts by status
    const statusCounts = {
      available: 0,
      normal: 0,
      busy: 0,
      overloaded: 0
    };

    Object.values(workloadSummary).forEach(user => {
      statusCounts[user.status]++;
    });

    res.json({
      success: true,
      data: {
        date: date,
        users: Object.values(workloadSummary),
        status_counts: statusCounts,
        total_users: Object.keys(workloadSummary).length
      }
    });

  } catch (error) {
    console.error('Get workload summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch workload summary'
      }
    });
  }
};

// Helper function to get allocation by ID with all related data
const getAllocationById = async (allocationId) => {
  const query = `
    SELECT 
      ta.*,
      p.name as project_name,
      t.name as task_name,
      CASE 
        WHEN ta.user_type = 'admin' THEN au.name
        WHEN ta.user_type = 'team' THEN tm.name
      END as user_name,
      CASE 
        WHEN ta.user_type = 'admin' THEN au.email
        WHEN ta.user_type = 'team' THEN tm.email
      END as user_email
    FROM team_allocations ta
    LEFT JOIN projects p ON ta.project_id = p.id
    LEFT JOIN tasks t ON ta.task_id = t.id
    LEFT JOIN admin_users au ON ta.user_id = au.id AND ta.user_type = 'admin'
    LEFT JOIN team_members tm ON ta.user_id = tm.id AND ta.user_type = 'team'
    WHERE ta.id = ?
  `;

  const allocations = await db.query(query, [allocationId]);
  return allocations[0];
};

module.exports = {
  getAllocations,
  getAllocation,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  getWorkloadSummary
};
