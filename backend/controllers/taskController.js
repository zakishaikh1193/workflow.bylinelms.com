const db = require('../db');

// Get all tasks with filters and pagination
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'created_at', 
      order = 'desc',
      project_id,
      status,
      priority,
      assignee_id,
      assignee_type,
      search
    } = req.query;

    // Simple approach first - just get tasks without complex JOINs
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const queryParams = [];

    // Add filters
    if (project_id) {
      query += ' AND project_id = ?';
      queryParams.push(project_id);
    }

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      queryParams.push(priority);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const validSortFields = ['name', 'created_at', 'updated_at', 'start_date', 'end_date', 'priority', 'status', 'progress'];
    const validOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toLowerCase())) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Add pagination - use hardcoded values first to test
    query += ' LIMIT 20 OFFSET 0';

    console.log('🔍 Task query:', query);
    console.log('🔍 Task params:', queryParams);

    // Execute query
    const tasks = await db.query(query, queryParams);

    // Get total count for pagination (simplified)
    const countResult = await db.query('SELECT COUNT(*) as total FROM tasks', []);
    const total = countResult[0].total;

    // Process tasks to include assignees and skills
    const processedTasks = await Promise.all(tasks.map(async (task) => {
      const taskWithDetails = await getTaskById(task.id);
      return taskWithDetails;
    }));

    console.log('📋 Processed tasks with assignees:', processedTasks.map(t => ({
      id: t.id,
      name: t.name,
      assignees: t.assignees,
      teamAssignees: t.teamAssignees
    })));

    res.json({
      success: true,
      data: processedTasks,
      pagination: {
        page: 1,
        limit: 20,
        total,
        pages: Math.ceil(total / 20)
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch tasks'
      }
    });
  }
};

// Get single task by ID
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        t.*,
        p.name as project_name,
        s.name as stage_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN stages s ON t.stage_id = s.id
      WHERE t.id = ?
    `;

    const tasks = await db.query(query, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    const task = tasks[0];

    // Get task assignees
    const assigneesQuery = `
      SELECT ta.*, tm.name as team_name, tm.email as team_email, au.name as admin_name, au.email as admin_email
      FROM task_assignees ta
      LEFT JOIN team_members tm ON ta.assignee_id = tm.id AND ta.assignee_type = 'team'
      LEFT JOIN admin_users au ON ta.assignee_id = au.id AND ta.assignee_type = 'admin'
      WHERE ta.task_id = ?
    `;
    const assignees = await db.query(assigneesQuery, [id]);

    // Get task skills
    const skillsQuery = `
      SELECT s.* 
      FROM task_skills ts
      JOIN skills s ON ts.skill_id = s.id
      WHERE ts.task_id = ?
    `;
    const skills = await db.query(skillsQuery, [id]);

    // Add assignees and skills to task
    task.assignees = assignees.map(a => ({
      id: a.assignee_id,
      type: a.assignee_type,
      name: a.team_name || a.admin_name,
      email: a.team_email || a.admin_email
    }));
    task.skills = skills;

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch task'
      }
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const {
      name,
      description,
      project_id,
      stage_id,
      status = 'not-started',
      priority = 'medium',
      start_date,
      end_date,
      progress = 0,
      estimated_hours = 0,
      component_path,
      assignees = [],
      skills = []
    } = req.body;

    const created_by = req.user?.id || 1;

    // Validate required fields
    if (!name || !project_id || !stage_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, project_id, stage_id, start_date, end_date'
        }
      });
    }

    // Format dates to YYYY-MM-DD
    const formattedStartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(end_date).toISOString().split('T')[0];

    // Create the task
    const insertQuery = `
      INSERT INTO tasks (
        name, description, project_id, stage_id, status, priority, 
        start_date, end_date, progress, estimated_hours, component_path, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      name, description, project_id, stage_id, status, priority,
      formattedStartDate, formattedEndDate, progress, estimated_hours, component_path, created_by
    ];

    console.log('🚀 Creating task with params:', insertParams);

    const result = await db.insert(insertQuery, insertParams);
    const taskId = result.insertId;

    // Add individual assignees if provided
    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        await db.insert(
          'INSERT INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)',
          [taskId, assigneeId, 'admin']
        );
      }
    }

    // Add team assignees if provided
    if (req.body.teamAssignees && req.body.teamAssignees.length > 0) {
      for (const teamId of req.body.teamAssignees) {
        await db.insert(
          'INSERT INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)',
          [taskId, teamId, 'team']
        );
      }
    }

    // Add skills if provided
    if (skills && skills.length > 0) {
      for (const skillId of skills) {
        await db.insert(
          'INSERT INTO task_skills (task_id, skill_id) VALUES (?, ?)',
          [taskId, skillId]
        );
      }
    }

    // Get the created task with all related data
    const createdTask = await getTaskById(taskId);

    console.log('✅ Task created with ID:', taskId);

    res.status(201).json({
      success: true,
      data: createdTask,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      priority,
      start_date,
      end_date,
      progress,
      estimated_hours,
      actual_hours,
      component_path,
      assignees,
      skills
    } = req.body;

    // Check if task exists
    const existing = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Build update query dynamically for provided fields
    let updateQuery = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    const updateParams = [];

    if (name !== undefined) {
      updateQuery += ', name = ?';
      updateParams.push(name);
    }
    if (description !== undefined) {
      updateQuery += ', description = ?';
      updateParams.push(description);
    }
    if (status !== undefined) {
      updateQuery += ', status = ?';
      updateParams.push(status);
    }
    if (priority !== undefined) {
      updateQuery += ', priority = ?';
      updateParams.push(priority);
    }
    if (start_date !== undefined) {
      updateQuery += ', start_date = ?';
      updateParams.push(new Date(start_date).toISOString().split('T')[0]);
    }
    if (end_date !== undefined) {
      updateQuery += ', end_date = ?';
      updateParams.push(new Date(end_date).toISOString().split('T')[0]);
    }
    if (progress !== undefined) {
      updateQuery += ', progress = ?';
      updateParams.push(progress);
    }
    if (estimated_hours !== undefined) {
      updateQuery += ', estimated_hours = ?';
      updateParams.push(estimated_hours);
    }
    if (actual_hours !== undefined) {
      updateQuery += ', actual_hours = ?';
      updateParams.push(actual_hours);
    }
    if (component_path !== undefined) {
      updateQuery += ', component_path = ?';
      updateParams.push(component_path);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    await db.query(updateQuery, updateParams);

    // Update assignees if provided
    if (assignees !== undefined || req.body.teamAssignees !== undefined) {
      // Remove existing assignees
      await db.query('DELETE FROM task_assignees WHERE task_id = ?', [id]);
      
      // Add new individual assignees
      if (assignees && assignees.length > 0) {
        for (const assigneeId of assignees) {
          await db.insert(
            'INSERT INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)',
            [id, assigneeId, 'admin']
          );
        }
      }

      // Add new team assignees
      if (req.body.teamAssignees && req.body.teamAssignees.length > 0) {
        for (const teamId of req.body.teamAssignees) {
          await db.insert(
            'INSERT INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)',
            [id, teamId, 'team']
          );
        }
      }
    }

    // Update skills if provided
    if (skills !== undefined) {
      // Remove existing skills
      await db.query('DELETE FROM task_skills WHERE task_id = ?', [id]);
      
      // Add new skills
      if (skills.length > 0) {
        for (const skillId of skills) {
          await db.insert(
            'INSERT INTO task_skills (task_id, skill_id) VALUES (?, ?)',
            [id, skillId]
          );
        }
      }
    }

    // Get updated task
    const updatedTask = await getTaskById(id);

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update task'
      }
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existing = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Delete task (CASCADE will handle related records)
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete task'
      }
    });
  }
};

// Helper function to get task by ID with all related data
const getTaskById = async (taskId) => {
  const query = `
    SELECT 
      t.*,
      p.name as project_name,
      s.name as stage_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN stages s ON t.stage_id = s.id
    WHERE t.id = ?
  `;

  const tasks = await db.query(query, [taskId]);
  const task = tasks[0];

  // Get assignees
  const assigneesQuery = `
    SELECT ta.*, tm.name as team_name, tm.email as team_email, au.name as admin_name, au.email as admin_email
    FROM task_assignees ta
    LEFT JOIN team_members tm ON ta.assignee_id = tm.id AND ta.assignee_type = 'team'
    LEFT JOIN admin_users au ON ta.assignee_id = au.id AND ta.assignee_type = 'admin'
    WHERE ta.task_id = ?
  `;
  const assignees = await db.query(assigneesQuery, [taskId]);

  // Get skills
  const skillsQuery = `
    SELECT s.* 
    FROM task_skills ts
    JOIN skills s ON ts.skill_id = s.id
    WHERE ts.task_id = ?
  `;
  const skills = await db.query(skillsQuery, [taskId]);

  // Get all individual assignees (both direct and from teams)
  const individualAssignees = assignees
    .filter(a => a.assignee_type === 'admin')
    .map(a => a.assignee_id);
  
  // Get team assignees and expand them to individual members
  const teamAssignees = assignees
    .filter(a => a.assignee_type === 'team')
    .map(a => a.assignee_id);
  
  // Get all team members from assigned teams
  let teamMemberIds = [];
  if (teamAssignees.length > 0) {
    const teamMembersQuery = `
      SELECT DISTINCT tmt.team_member_id
      FROM team_members_teams tmt
      WHERE tmt.team_id IN (${teamAssignees.map(() => '?').join(',')})
      AND tmt.is_active = 1
    `;
    const teamMembersResult = await db.query(teamMembersQuery, teamAssignees);
    teamMemberIds = teamMembersResult.map(tm => tm.team_member_id);
  }
  
  // Combine individual assignees with team member assignees
  task.assignees = [...individualAssignees, ...teamMemberIds];
  
  // Keep teamAssignees for reference (but frontend will show individual members)
  task.teamAssignees = teamAssignees;
  
  task.skills = skills;

  return task;
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
