const db = require('../db');

// Helper function to calculate task progress based on status
const calculateTaskProgress = (status) => {
  switch (status) {
    case 'not-started':
      return 0;
    case 'in-progress':
      return 50; // Default to 50% for in-progress tasks
    case 'under-review':
      return 90; // 90% when under review
    case 'completed':
      return 100;
    case 'blocked':
      return 25; // 25% for blocked tasks (some work done)
    default:
      return 0;
  }
};

// Helper function to recalculate project progress
const recalculateProjectProgress = async (projectId) => {
  try {
    const progressQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        AVG(progress) as avg_progress
      FROM tasks 
      WHERE project_id = ?
    `;
    
    const result = await db.query(progressQuery, [projectId]);
    
    let calculatedProgress = 0;
    if (result.length > 0 && result[0].total_tasks > 0) {
      calculatedProgress = Math.round(result[0].avg_progress || 0);
    }
    
    // Update project progress
    await db.query('UPDATE projects SET progress = ? WHERE id = ?', [calculatedProgress, projectId]);
    
    console.log(`🔄 Updated project ${projectId} progress to ${calculatedProgress}%`);
    
    return calculatedProgress;
  } catch (error) {
    console.error('Error recalculating project progress:', error);
    return 0;
  }
};

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
      search,
      stage_id,
      grade_id,
      book_id,
      unit_id,
      lesson_id,
      all = false
    } = req.query;

    // Build query with optional JOIN for assignee sorting and filtering
    let query = 'SELECT t.*, cs.name as stage_name FROM tasks t LEFT JOIN category_stages cs ON t.category_stage_id = cs.id';
    const queryParams = [];
    
    // Debug: Check what stages are available and what tasks exist
    try {
      const allStages = await db.query('SELECT id, name FROM category_stages ORDER BY id');
      const allTasks = await db.query('SELECT id, name, category_stage_id FROM tasks LIMIT 20');
      console.log('🔍 All available stages:', allStages);
      console.log('🔍 Sample tasks with stage IDs:', allTasks);
      console.log('🔍 Unique category_stage_id values in tasks:', [...new Set(allTasks.map(t => t.category_stage_id))]);
      
      // Check if the requested stage_id exists in the stages table
      if (stage_id && stage_id !== 'all') {
        const stageIdNum = parseInt(stage_id, 10);
        const stageExists = allStages.find(s => s.id === stageIdNum);
        console.log('🔍 Requested stage_id:', stageIdNum);
        console.log('🔍 Stage exists in database:', !!stageExists);
        console.log('🔍 Stage details:', stageExists);
        
        // Check if any tasks have this stage_id
        const tasksWithStage = allTasks.filter(t => t.category_stage_id === stageIdNum);
        console.log('🔍 Tasks with selected stage ID', stageIdNum, ':', tasksWithStage.length);
        console.log('🔍 Tasks with selected stage:', tasksWithStage);
      }
    } catch (error) {
      console.log('🔍 Error in debug queries:', error.message);
    }
    
    // Add JOIN for assignee sorting or filtering if needed
    if (sort === 'assignees' || assignee_id) {
      query += ' LEFT JOIN task_assignees ta ON t.id = ta.task_id LEFT JOIN admin_users au ON ta.assignee_id = au.id AND ta.assignee_type = "admin" LEFT JOIN team_members tm ON ta.assignee_id = tm.id AND ta.assignee_type = "team"';
    }
    
    query += ' WHERE 1=1';

    // Add filters
    if (project_id) {
      query += ' AND t.project_id = ?';
      queryParams.push(project_id);
    }

    if (status) {
      query += ' AND t.status = ?';
      queryParams.push(status);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      queryParams.push(priority);
    }

    if (stage_id && stage_id !== 'all') {
      // Convert stage_id to number if it's a string
      const stageIdNum = parseInt(stage_id, 10);
      query += ' AND t.category_stage_id = ?';
      queryParams.push(stageIdNum);
      console.log('🔍 Stage filter applied in backend:', stage_id);
      console.log('🔍 Stage filter type:', typeof stage_id);
      console.log('🔍 Stage filter value:', stage_id);
      console.log('🔍 Stage filter converted to number:', stageIdNum);
      console.log('🔍 Stage filter query addition:', ' AND t.category_stage_id = ?');
      console.log('🔍 Stage filter parameter added to queryParams');
    } else {
      console.log('🔍 No stage_id provided in query parameters or stage_id is "all"');
    }

    // Add hierarchy filters
    if (grade_id) {
      query += ' AND t.grade_id = ?';
      queryParams.push(parseInt(grade_id, 10));
      console.log('🔍 Grade filter applied:', grade_id);
    }

    if (book_id) {
      query += ' AND t.book_id = ?';
      queryParams.push(parseInt(book_id, 10));
      console.log('🔍 Book filter applied:', book_id);
    }

    if (unit_id) {
      query += ' AND t.unit_id = ?';
      queryParams.push(parseInt(unit_id, 10));
      console.log('🔍 Unit filter applied:', unit_id);
    }

    if (lesson_id && lesson_id !== 'null') {
      query += ' AND t.lesson_id = ?';
      queryParams.push(parseInt(lesson_id, 10));
      console.log('🔍 Lesson filter applied:', lesson_id);
    } else if (lesson_id === 'null') {
      query += ' AND t.lesson_id IS NULL';
      console.log('🔍 Lesson filter applied: IS NULL');
    }

    if (search) {
      query += ' AND (t.name LIKE ? OR t.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (assignee_id) {
      if (assignee_id === 'none') {
        // Filter for tasks with no assignees
        query += ' AND ta.task_id IS NULL';
      } else {
        // Filter for tasks assigned to specific user
        query += ' AND ta.assignee_id = ?';
        queryParams.push(assignee_id);
      }
    }

    // Add GROUP BY if we have JOINs to ensure distinct tasks
    if (sort === 'assignees' || assignee_id) {
      query += ' GROUP BY t.id';
    }
    
    // Add sorting
    const validSortFields = ['name', 'created_at', 'updated_at', 'start_date', 'end_date', 'priority', 'status', 'progress'];
    const validOrders = ['asc', 'desc'];
    
    if (sort === 'assignees') {
      // Special handling for assignee sorting - consider both admin users and team members
      query += ` ORDER BY COALESCE(au.name, tm.name, '') ${order.toUpperCase()}, t.created_at DESC`;
    } else if (validSortFields.includes(sort) && validOrders.includes(order.toLowerCase())) {
      query += ` ORDER BY t.${sort} ${order.toUpperCase()}`;
    } else {
      query += ' ORDER BY t.created_at DESC';
    }

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Add pagination only if not requesting all tasks
    if (all !== 'true') {
      query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    }

    console.log('🔍 Task query:', query);
    console.log('🔍 Task params:', queryParams);
    console.log('🔍 Stage filter debug - stage_id from query:', req.query.stage_id);
    console.log('🔍 Hierarchy filters:', { grade_id, book_id, unit_id, lesson_id });
    console.log('🔍 All query parameters:', req.query);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Pagination:', { page, limit, offset });
    console.log('🔍 Final query with pagination:', query);

    // Execute query
    let tasks;
    try {
      tasks = await db.query(query, queryParams);
      console.log('🔍 Raw tasks from database:', tasks.length, 'tasks');
      console.log('🔍 Sample task stage info:', tasks.slice(0, 3).map(t => ({
        id: t.id,
        name: t.name,
        category_stage_id: t.category_stage_id,
        stage_name: t.stage_name,
        category_stage_id_type: typeof t.category_stage_id
      })));
      console.log('🔍 All tasks category_stage_id values:', tasks.map(t => ({
        id: t.id,
        name: t.name,
        category_stage_id: t.category_stage_id
      })));
      console.log('🔍 Unique category_stage_id values in results:', [...new Set(tasks.map(t => t.category_stage_id))]);
    } catch (error) {
      console.error('❌ Database query error:', error);
      console.error('❌ Query that failed:', query);
      console.error('❌ Parameters:', queryParams);
      throw error;
    }
    
    console.log('🔍 Raw tasks from database:', tasks.length, 'tasks');
    console.log('🔍 First few task IDs:', tasks.slice(0, 5).map(t => t.id));

    // Get total count for pagination with same filters
    let countQuery = 'SELECT COUNT(DISTINCT t.id) as total FROM tasks t LEFT JOIN category_stages cs ON t.category_stage_id = cs.id';
    const countParams = [];
    
    if (sort === 'assignees' || assignee_id) {
      countQuery += ' LEFT JOIN task_assignees ta ON t.id = ta.task_id LEFT JOIN admin_users au ON ta.assignee_id = au.id AND ta.assignee_type = "admin" LEFT JOIN team_members tm ON ta.assignee_id = tm.id AND ta.assignee_type = "team"';
    }
    countQuery += ' WHERE 1=1';
    
    // Add same filters to count query
    if (project_id) {
      countQuery += ' AND t.project_id = ?';
      countParams.push(project_id);
    }
    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }
    if (priority) {
      countQuery += ' AND t.priority = ?';
      countParams.push(priority);
    }
    if (stage_id && stage_id !== 'all') {
      // Convert stage_id to number if it's a string
      const stageIdNum = parseInt(stage_id, 10);
      countQuery += ' AND t.category_stage_id = ?';
      countParams.push(stageIdNum);
    }
    
    // Add hierarchy filters to count query
    if (grade_id) {
      countQuery += ' AND t.grade_id = ?';
      countParams.push(parseInt(grade_id, 10));
    }
    if (book_id) {
      countQuery += ' AND t.book_id = ?';
      countParams.push(parseInt(book_id, 10));
    }
    if (unit_id) {
      countQuery += ' AND t.unit_id = ?';
      countParams.push(parseInt(unit_id, 10));
    }
    if (lesson_id && lesson_id !== 'null') {
      countQuery += ' AND t.lesson_id = ?';
      countParams.push(parseInt(lesson_id, 10));
    } else if (lesson_id === 'null') {
      countQuery += ' AND t.lesson_id IS NULL';
    }
    
    if (search) {
      countQuery += ' AND (t.name LIKE ? OR t.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (assignee_id) {
      if (assignee_id === 'none') {
        // Filter for tasks with no assignees
        countQuery += ' AND ta.task_id IS NULL';
      } else {
        // Filter for tasks assigned to specific user
        countQuery += ' AND ta.assignee_id = ?';
        countParams.push(assignee_id);
      }
    }
    
    console.log('🔍 Count query:', countQuery);
    console.log('🔍 Count params:', countParams);
    console.log('🔍 Count query hierarchy filters:', { grade_id, book_id, unit_id, lesson_id });
    
    let countResult;
    try {
      countResult = await db.query(countQuery, countParams);
    } catch (error) {
      console.error('❌ Count query error:', error);
      console.error('❌ Count query that failed:', countQuery);
      console.error('❌ Count parameters:', countParams);
      throw error;
    }
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

    console.log('📋 Final response pagination:', {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      returnedTasks: processedTasks.length
    });

    res.json({
      success: true,
      data: processedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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

// Test endpoint for stage filtering
const testStageFilter = async (req, res) => {
  try {
    const { stage_id } = req.query;
    console.log('🧪 Test stage filter - stage_id:', stage_id);
    
    // Get all stages
    const stages = await db.query('SELECT id, name FROM category_stages ORDER BY id');
    console.log('🧪 All stages:', stages);
    
    // Get all tasks with stage info
    const tasks = await db.query(`
      SELECT t.id, t.name, t.category_stage_id, cs.name as stage_name 
      FROM tasks t 
      LEFT JOIN category_stages cs ON t.category_stage_id = cs.id 
      LIMIT 50
    `);
    console.log('🧪 All tasks with stage info:', tasks);
    
    // Filter by stage if provided
    let filteredTasks = tasks;
    if (stage_id && stage_id !== 'all') {
      const stageIdNum = parseInt(stage_id, 10);
      filteredTasks = tasks.filter(t => t.category_stage_id === stageIdNum);
      console.log('🧪 Filtered tasks for stage', stageIdNum, ':', filteredTasks);
    }
    
    res.json({
      success: true,
      stage_id: stage_id,
      stages: stages,
      all_tasks: tasks,
      filtered_tasks: filteredTasks,
      total_stages: stages.length,
      total_tasks: tasks.length,
      filtered_count: filteredTasks.length
    });
  } catch (error) {
    console.error('Test stage filter error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bulk create tasks for all hierarchy units and stages
const bulkCreateTasks = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    console.log(`🚀 Starting bulk task creation for project ${project_id}`);

    // Step 1: Get project details and category
    const projectQuery = 'SELECT * FROM projects WHERE id = ?';
    const projects = await db.query(projectQuery, [project_id]);
    
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    const project = projects[0];
    const categoryId = project.category_id;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project must have a category assigned'
        }
      });
    }

    // Step 2: Get all stages for this project's category
    const stagesQuery = `
      SELECT cs.*, st.order_index as template_order
      FROM category_stages cs
      INNER JOIN stage_templates st ON cs.id = st.stage_id
      WHERE st.category_id = ?
      ORDER BY st.order_index ASC
    `;
    
    const stages = await db.query(stagesQuery, [categoryId]);
    
    if (stages.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No stages found for this project category'
        }
      });
    }

    console.log(`📋 Found ${stages.length} stages for category ${categoryId}`);

    // Step 3: Get all educational hierarchy for this project
    const gradesQuery = 'SELECT * FROM grades WHERE project_id = ? ORDER BY order_index ASC';
    const grades = await db.query(gradesQuery, [project_id]);
    
    // Get books for all grades in this project
    const gradeIds = grades.map(g => g.id);
    const booksQuery = gradeIds.length > 0 ? 
      `SELECT * FROM books WHERE grade_id IN (${gradeIds.map(() => '?').join(',')}) ORDER BY order_index ASC` :
      'SELECT * FROM books WHERE 1=0';
    const books = await db.query(booksQuery, gradeIds);
    
    // Get units for all books in this project
    const bookIds = books.map(b => b.id);
    const unitsQuery = bookIds.length > 0 ?
      `SELECT * FROM units WHERE book_id IN (${bookIds.map(() => '?').join(',')}) ORDER BY order_index ASC` :
      'SELECT * FROM units WHERE 1=0';
    const units = await db.query(unitsQuery, bookIds);
    
    // Get lessons for all units in this project
    const unitIds = units.map(u => u.id);
    const lessonsQuery = unitIds.length > 0 ?
      `SELECT * FROM lessons WHERE unit_id IN (${unitIds.map(() => '?').join(',')}) ORDER BY order_index ASC` :
      'SELECT * FROM lessons WHERE 1=0';
    const lessons = await db.query(lessonsQuery, unitIds);

    console.log(`📚 Found ${grades.length} grades, ${books.length} books, ${units.length} units, ${lessons.length} lessons`);

    // Step 4: Identify the lowest hierarchical units
    const lowestUnits = [];
    
    // Process all lessons first (they are always the lowest units)
    if (lessons.length > 0) {
      lessons.forEach(lesson => {
        const unit = units.find(u => u.id === lesson.unit_id);
        const book = books.find(b => b.id === unit?.book_id);
        const grade = grades.find(g => g.id === book?.grade_id);
        
        if (unit && book && grade) {
          lowestUnits.push({
            type: 'lesson',
            grade_id: grade.id,
            book_id: book.id,
            unit_id: unit.id,
            lesson_id: lesson.id,
            component_path: `${grade.name} > ${book.name} > ${unit.name} > ${lesson.name}`,
            name: lesson.name
          });
        }
      });
    }
    
    // Process units that don't have lessons (they are lowest units)
    if (units.length > 0) {
      units.forEach(unit => {
        // Check if this unit has any lessons
        const unitHasLessons = lessons.some(lesson => lesson.unit_id === unit.id);
        
        // Only add this unit if it doesn't have lessons
        if (!unitHasLessons) {
          const book = books.find(b => b.id === unit.book_id);
          const grade = grades.find(g => g.id === book?.grade_id);
          
          if (book && grade) {
            lowestUnits.push({
              type: 'unit',
              grade_id: grade.id,
              book_id: book.id,
              unit_id: unit.id,
              lesson_id: null,
              component_path: `${grade.name} > ${book.name} > ${unit.name}`,
              name: unit.name
            });
          }
        }
      });
    }
    
    // Process books that don't have units (they are lowest units)
    if (books.length > 0) {
      books.forEach(book => {
        // Check if this book has any units
        const bookHasUnits = units.some(unit => unit.book_id === book.id);
        
        // Only add this book if it doesn't have units
        if (!bookHasUnits) {
          const grade = grades.find(g => g.id === book.grade_id);
          
          if (grade) {
            lowestUnits.push({
              type: 'book',
              grade_id: grade.id,
              book_id: book.id,
              unit_id: null,
              lesson_id: null,
              component_path: `${grade.name} > ${book.name}`,
              name: book.name
            });
          }
        }
      });
    }
    
    // Process grades that don't have books (they are lowest units)
    if (grades.length > 0) {
      grades.forEach(grade => {
        // Check if this grade has any books
        const gradeHasBooks = books.some(book => book.grade_id === grade.id);
        
        // Only add this grade if it doesn't have books
        if (!gradeHasBooks) {
          lowestUnits.push({
            type: 'grade',
            grade_id: grade.id,
            book_id: null,
            unit_id: null,
            lesson_id: null,
            component_path: grade.name,
            name: grade.name
          });
        }
      });
    }

    if (lowestUnits.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No educational hierarchy found for this project'
        }
      });
    }

    console.log(`🎯 Identified ${lowestUnits.length} lowest hierarchical units`);

    // Step 5: Check for existing tasks to avoid duplicates
    const existingTasksQuery = `
      SELECT grade_id, book_id, unit_id, lesson_id, category_stage_id
      FROM tasks 
      WHERE project_id = ?
    `;
    const existingTasks = await db.query(existingTasksQuery, [project_id]);
    
    const existingTaskKeys = new Set();
    existingTasks.forEach(task => {
      const key = `${task.grade_id || 'null'}-${task.book_id || 'null'}-${task.unit_id || 'null'}-${task.lesson_id || 'null'}-${task.category_stage_id}`;
      existingTaskKeys.add(key);
    });

    // Step 6: Create tasks for each lowest unit × each stage
    const createdTasks = [];
    const skippedTasks = [];
    const createdBy = req.user?.id || req.teamMember?.id || 1;

    for (const unit of lowestUnits) {
      for (const stage of stages) {
        const taskKey = `${unit.grade_id || 'null'}-${unit.book_id || 'null'}-${unit.unit_id || 'null'}-${unit.lesson_id || 'null'}-${stage.id}`;
        
        if (existingTaskKeys.has(taskKey)) {
          skippedTasks.push({
            ...unit,
            stage_id: stage.id,
            stage_name: stage.name,
            reason: 'Task already exists'
          });
          continue;
        }

        // Create task
        const taskData = {
          name: `${unit.component_path} - ${stage.name}`,
          description: `Task for ${unit.component_path} at ${stage.name} stage`,
          project_id: parseInt(project_id),
          category_stage_id: stage.id,
          grade_id: unit.grade_id,
          book_id: unit.book_id,
          unit_id: unit.unit_id,
          lesson_id: unit.lesson_id,
          component_path: unit.component_path,
          status: 'not-started',
          priority: 'medium',
          start_date: new Date().toISOString().split('T')[0],
          end_date: project.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Use project end date or default to 30 days
          progress: 0,
          estimated_hours: 8,
          created_by: createdBy
        };

        const insertQuery = `
          INSERT INTO tasks (
            name, description, project_id, category_stage_id, grade_id, book_id, unit_id, lesson_id,
            component_path, status, priority, start_date, end_date, progress, estimated_hours, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
          taskData.name, taskData.description, taskData.project_id, taskData.category_stage_id,
          taskData.grade_id, taskData.book_id, taskData.unit_id, taskData.lesson_id,
          taskData.component_path, taskData.status, taskData.priority, taskData.start_date,
          taskData.end_date, taskData.progress, taskData.estimated_hours, taskData.created_by
        ];

        const result = await db.insert(insertQuery, insertParams);
        
        createdTasks.push({
          id: result.insertId,
          ...taskData
        });

        console.log(`✅ Created task: ${taskData.name}`);
      }
    }

    console.log(`🎉 Bulk task creation completed! Created: ${createdTasks.length}, Skipped: ${skippedTasks.length}`);

    res.json({
      success: true,
      data: {
        project_id: parseInt(project_id),
        project_name: project.name,
        total_stages: stages.length,
        total_lowest_units: lowestUnits.length,
        expected_tasks: stages.length * lowestUnits.length,
        created_tasks: createdTasks.length,
        skipped_tasks: skippedTasks.length,
        created_tasks_details: createdTasks,
        skipped_tasks_details: skippedTasks
      },
      message: `Successfully created ${createdTasks.length} tasks for ${lowestUnits.length} hierarchical units across ${stages.length} stages`
    });

  } catch (error) {
    console.error('Bulk create tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to bulk create tasks',
        details: error.message
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
        cs.name as stage_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN category_stages cs ON t.category_stage_id = cs.id
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

    // Add assignees and skills to task (consistent with getTaskById)
    task.assignees = assignees.map(a => a.assignee_id);
    
    // For backward compatibility, also provide team assignees separately
    task.teamAssignees = assignees
      .filter(a => a.assignee_type === 'team')
      .map(a => a.assignee_id);
    
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
  console.log('🔍 CREATE TASK - Starting task creation process');
  console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User:', req.user);
  
  try {
    const {
      name,
      description,
      project_id,
      category_stage_id,
      status = 'not-started',
      priority = 'medium',
      start_date,
      end_date,
      progress = 0,
      estimated_hours = 0,
      component_path,
      grade_id,
      book_id,
      unit_id,
      lesson_id,
      assignees = [],
      skills = []
    } = req.body;

    const created_by = req.user?.id || 1;
    console.log('🔧 Extracted parameters:', {
      name, description, project_id, category_stage_id, status, priority,
      start_date, end_date, progress, estimated_hours, component_path,
      grade_id, book_id, unit_id, lesson_id, assignees, skills, created_by
    });

    // Validate required fields
    console.log('✅ Validating required fields...');
    if (!name || !project_id || !category_stage_id || !start_date || !end_date) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, project_id, category_stage_id, start_date, end_date'
        }
      });
    }
    console.log('✅ Validation passed');

    // Format dates to YYYY-MM-DD
    console.log('📅 Formatting dates...');
    const formattedStartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(end_date).toISOString().split('T')[0];
    console.log('📅 Formatted dates:', { formattedStartDate, formattedEndDate });

    // Create the task
    console.log('🗄️ Preparing database insert...');
    const insertQuery = `
      INSERT INTO tasks (
        name, description, project_id, category_stage_id, status, priority, 
        start_date, end_date, progress, estimated_hours, component_path, 
        grade_id, book_id, unit_id, lesson_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Auto-calculate progress based on status
    const calculatedProgress = calculateTaskProgress(status);
    console.log('📊 Calculated progress:', calculatedProgress);
    
    const insertParams = [
      name, description, project_id, category_stage_id, status, priority,
      formattedStartDate, formattedEndDate, calculatedProgress, parseInt(estimated_hours) || 0, component_path,
      grade_id || null, book_id || null, unit_id || null, lesson_id || null, created_by
    ];

    console.log('🚀 Creating task with params:', insertParams);
    console.log('📚 Educational hierarchy data:', { grade_id, book_id, unit_id, lesson_id, component_path });
    console.log('🔍 Insert query:', insertQuery);

    console.log('💾 Executing database insert...');
    const result = await db.insert(insertQuery, insertParams);
    const taskId = result.insertId;
    console.log('✅ Task inserted successfully with ID:', taskId);

    // Add assignees if provided
    if (assignees && assignees.length > 0) {
      console.log('👥 Processing assignees:', assignees);
      for (const assigneeId of assignees) {
        console.log(`🔍 Checking assignee type for ID: ${assigneeId}`);
        // Determine assignee type by checking if it's a team member or admin
        const teamMemberCheck = await db.query(
          'SELECT id FROM team_members WHERE id = ? AND is_active = true',
          [assigneeId]
        );
        
        const assigneeType = teamMemberCheck.length > 0 ? 'team' : 'admin';
        console.log(`👤 Assignee ${assigneeId} is type: ${assigneeType}`);
        
        console.log(`💾 Inserting task assignee: task_id=${taskId}, assignee_id=${assigneeId}, assignee_type=${assigneeType}`);
        await db.insert(
          'INSERT INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)',
          [taskId, assigneeId, assigneeType]
        );
        
        console.log(`✅ Assigned task ${taskId} to ${assigneeType} user ${assigneeId}`);
      }
    } else {
      console.log('👥 No assignees to process');
    }

    // Add skills if provided
    if (skills && skills.length > 0) {
      console.log('🎯 Processing skills:', skills);
      for (const skillId of skills) {
        console.log(`💾 Inserting task skill: task_id=${taskId}, skill_id=${skillId}`);
        await db.insert(
          'INSERT INTO task_skills (task_id, skill_id) VALUES (?, ?)',
          [taskId, skillId]
        );
        console.log(`✅ Added skill ${skillId} to task ${taskId}`);
      }
    } else {
      console.log('🎯 No skills to process');
    }

    // Get the created task with all related data
    console.log('📋 Fetching created task data...');
    const createdTask = await getTaskById(taskId);
    console.log('✅ Retrieved created task:', createdTask);

    // Recalculate project progress
    console.log('📊 Recalculating project progress...');
    await recalculateProjectProgress(project_id);
    console.log('✅ Project progress recalculated');

    console.log('🎉 Task creation completed successfully!');
    console.log('📤 Sending success response...');

    res.status(201).json({
      success: true,
      data: createdTask,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('💥 CREATE TASK ERROR - Full error details:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sqlMessage:', error.sqlMessage);
    
    // Log additional database error details if available
    if (error.sql) {
      console.error('Failed SQL query:', error.sql);
    }
    if (error.sqlMessage) {
      console.error('SQL Error message:', error.sqlMessage);
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create task',
        details: error.message,
        sqlError: error.sqlMessage || null
      }
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  console.log('🔍 UPDATE TASK - Starting task update process');
  console.log('📥 Request params:', req.params);
  console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User:', req.user);
  
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
      grade_id,
      book_id,
      unit_id,
      lesson_id,
      assignees,
      skills
    } = req.body;

    console.log('🔧 Extracted parameters:', {
      id, name, description, status, priority, start_date, end_date,
      progress, estimated_hours, actual_hours, component_path,
      grade_id, book_id, unit_id, lesson_id, assignees, skills
    });

    // Check if task exists
    console.log('🔍 Checking if task exists...');
    const existing = await db.query('SELECT id FROM tasks WHERE id = ?', [id]);
    console.log('🔍 Task existence check result:', existing);
    
    if (existing.length === 0) {
      console.log('❌ Task not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    console.log('✅ Task exists');

    // Build update query dynamically for provided fields
    console.log('🔧 Building update query...');
    let updateQuery = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    const updateParams = [];

    if (name !== undefined) {
      updateQuery += ', name = ?';
      updateParams.push(name);
      console.log('📝 Adding name to update');
    }
    if (description !== undefined) {
      updateQuery += ', description = ?';
      updateParams.push(description);
      console.log('📝 Adding description to update');
    }
    if (status !== undefined) {
      updateQuery += ', status = ?';
      updateParams.push(status);
      console.log('📝 Adding status to update');
    }
    if (priority !== undefined) {
      updateQuery += ', priority = ?';
      updateParams.push(priority);
      console.log('📝 Adding priority to update');
    }
    if (start_date !== undefined) {
      updateQuery += ', start_date = ?';
      updateParams.push(new Date(start_date).toISOString().split('T')[0]);
      console.log('📝 Adding start_date to update');
    }
    if (end_date !== undefined) {
      updateQuery += ', end_date = ?';
      updateParams.push(new Date(end_date).toISOString().split('T')[0]);
      console.log('📝 Adding end_date to update');
    }
    // Auto-calculate progress based on status if status is being updated
    if (status !== undefined) {
      const calculatedProgress = calculateTaskProgress(status);
      updateQuery += ', progress = ?';
      updateParams.push(calculatedProgress);
      console.log(`🔄 Auto-calculated progress for status '${status}': ${calculatedProgress}%`);
    } else if (progress !== undefined) {
      // If progress is explicitly provided, use it
      updateQuery += ', progress = ?';
      updateParams.push(progress);
      console.log('📝 Adding explicit progress to update');
    }
    if (estimated_hours !== undefined) {
      updateQuery += ', estimated_hours = ?';
      updateParams.push(parseInt(estimated_hours) || 0);
      console.log('📝 Adding estimated_hours to update');
    }
    if (actual_hours !== undefined) {
      updateQuery += ', actual_hours = ?';
      updateParams.push(parseInt(actual_hours) || 0);
      console.log('📝 Adding actual_hours to update');
    }
    if (component_path !== undefined) {
      updateQuery += ', component_path = ?';
      updateParams.push(component_path);
      console.log('📝 Adding component_path to update');
    }
    if (req.body.category_stage_id !== undefined) {
      updateQuery += ', category_stage_id = ?';
      updateParams.push(req.body.category_stage_id);
      console.log('📝 Adding category_stage_id to update');
    }
    if (grade_id !== undefined) {
      updateQuery += ', grade_id = ?';
      updateParams.push(grade_id);
      console.log('📝 Adding grade_id to update');
    }
    if (book_id !== undefined) {
      updateQuery += ', book_id = ?';
      updateParams.push(book_id);
      console.log('📝 Adding book_id to update');
    }
    if (unit_id !== undefined) {
      updateQuery += ', unit_id = ?';
      updateParams.push(unit_id);
      console.log('📝 Adding unit_id to update');
    }
    if (lesson_id !== undefined) {
      updateQuery += ', lesson_id = ?';
      updateParams.push(lesson_id);
      console.log('📝 Adding lesson_id to update');
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    console.log('🔍 Final update query:', updateQuery);
    console.log('🔍 Update parameters:', updateParams);

    console.log('💾 Executing task update...');
    await db.query(updateQuery, updateParams);
    console.log('✅ Task update executed successfully');

    // Update assignees if provided
    if (assignees !== undefined || req.body.teamAssignees !== undefined) {
      console.log('🔄 Updating assignees for task', id, ':', { assignees, teamAssignees: req.body.teamAssignees });
      try {
        // Remove existing assignees first
        await db.query('DELETE FROM task_assignees WHERE task_id = ?', [id]);
        
        // Prepare all assignee insertions
        const assigneeInserts = [];
        
        // Add assignees
        if (assignees && assignees.length > 0) {
          for (const assigneeId of assignees) {
            // Determine assignee type by checking if it's a team member or admin
            const teamMemberCheck = await db.query(
              'SELECT id FROM team_members WHERE id = ? AND is_active = true',
              [assigneeId]
            );
            
            const assigneeType = teamMemberCheck.length > 0 ? 'team' : 'admin';
            assigneeInserts.push([id, assigneeId, assigneeType]);
            
            console.log(`👤 Updated task ${id} assignment to ${assigneeType} user ${assigneeId}`);
          }
        }
        
        // Insert all assignees in batch if any exist
        if (assigneeInserts.length > 0) {
          console.log('📝 Inserting assignees:', assigneeInserts);
          const insertQuery = 'INSERT IGNORE INTO task_assignees (task_id, assignee_id, assignee_type) VALUES (?, ?, ?)';
          for (const insertParams of assigneeInserts) {
            await db.insert(insertQuery, insertParams);
          }
        }
      } catch (assigneeError) {
        console.error('Error updating assignees:', assigneeError);
        // Continue with the update even if assignee update fails
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

    // Recalculate project progress
    await recalculateProjectProgress(updatedTask.project_id);

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

    // Check if task exists and get project_id
    const existing = await db.query('SELECT id, project_id FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    const projectId = existing[0].project_id;

    // Delete task (CASCADE will handle related records)
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    // Recalculate project progress
    await recalculateProjectProgress(projectId);

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
      cs.name as stage_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN category_stages cs ON t.category_stage_id = cs.id
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

  // Get all assignees (both admin and team) with names
  task.assignees = assignees.map(a => a.assignee_id);
  
  // Add assignee details with names
  task.assigneeDetails = assignees.map(a => ({
    id: a.assignee_id,
    type: a.assignee_type,
    name: a.assignee_type === 'team' ? a.team_name : a.admin_name,
    email: a.assignee_type === 'team' ? a.team_email : a.admin_email
  }));
  
  // For backward compatibility, also provide team assignees separately
  task.teamAssignees = assignees
    .filter(a => a.assignee_type === 'team')
    .map(a => a.assignee_id);
  
  task.skills = skills;

  return task;
};

// =====================================================
// TASK EXTENSIONS CONTROLLERS
// =====================================================

// Request task extension
const requestTaskExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { requested_due_date, reason } = req.body;
    const requested_by = req.user?.id;
    const requested_by_type = req.user?.type || 'team';
    
    // Debug logging
    console.log('🔍 Extension request - User info:', {
      userId: requested_by,
      userType: requested_by_type,
      reqUser: req.user
    });

    // Validate required fields
    if (!requested_due_date || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: requested_due_date, reason'
        }
      });
    }

    // Check if task exists and get current due date
    const taskQuery = 'SELECT id, end_date FROM tasks WHERE id = ?';
    const tasks = await db.query(taskQuery, [id]);
    
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
    const current_due_date = task.end_date;
    const formattedRequestedDate = new Date(requested_due_date).toISOString().split('T')[0];

    // Check if requested date is after current due date
    if (new Date(formattedRequestedDate) <= new Date(current_due_date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Requested due date must be after the current due date'
        }
      });
    }

    // Check if there's already a pending extension request
    const existingRequest = await db.query(
      'SELECT id FROM task_extensions WHERE task_id = ? AND status = "pending"',
      [id]
    );

    if (existingRequest.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_REQUEST',
          message: 'There is already a pending extension request for this task'
        }
      });
    }

    // Create extension request
    const insertQuery = `
      INSERT INTO task_extensions (
        task_id, requested_by, requested_by_type, current_due_date, 
        requested_due_date, reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    const result = await db.insert(insertQuery, [
      id, requested_by, requested_by_type, current_due_date, 
      formattedRequestedDate, reason
    ]);

    console.log('✅ Extension request created:', result.insertId);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        task_id: id,
        requested_due_date: formattedRequestedDate,
        reason,
        status: 'pending'
      },
      message: 'Extension request submitted successfully'
    });

  } catch (error) {
    console.error('Request extension error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to submit extension request'
      }
    });
  }
};

// Get task extensions
const getTaskExtensions = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        te.*,
        COALESCE(
          tm.name,
          au.name,
          'Unknown User'
        ) as requester_name,
        CASE 
          WHEN te.reviewed_by IS NOT NULL THEN admin_reviewer.name
          ELSE NULL
        END as reviewer_name
      FROM task_extensions te
      LEFT JOIN team_members tm ON te.requested_by = tm.id
      LEFT JOIN admin_users au ON te.requested_by = au.id
      LEFT JOIN admin_users admin_reviewer ON te.reviewed_by = admin_reviewer.id
      WHERE te.task_id = ?
      ORDER BY te.created_at DESC
    `;

    const extensions = await db.query(query, [id]);

    res.json({
      success: true,
      data: extensions
    });

  } catch (error) {
    console.error('Get task extensions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch task extensions'
      }
    });
  }
};

// Review extension request (admin only)
const reviewExtensionRequest = async (req, res) => {
  try {
    const { extensionId } = req.params;
    const { status, review_notes } = req.body;
    const reviewed_by = req.user?.id;

    if (!req.user) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only admins can review extension requests'
        }
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "approved" or "rejected"'
        }
      });
    }

    // Check if extension request exists
    const extensionQuery = 'SELECT * FROM task_extensions WHERE id = ? AND status = "pending"';
    const extensions = await db.query(extensionQuery, [extensionId]);
    
    if (extensions.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Extension request not found or already reviewed'
        }
      });
    }

    const extension = extensions[0];

    // Update extension request
    const updateQuery = `
      UPDATE task_extensions 
      SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_notes = ?
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [status, reviewed_by, review_notes, extensionId]);

    // If approved, update task due date
    if (status === 'approved') {
      const taskUpdateQuery = 'UPDATE tasks SET end_date = ? WHERE id = ?';
      await db.query(taskUpdateQuery, [extension.requested_due_date, extension.task_id]);
      console.log(`✅ Task ${extension.task_id} due date updated to ${extension.requested_due_date}`);
    }

    res.json({
      success: true,
      message: `Extension request ${status} successfully`
    });

  } catch (error) {
    console.error('Review extension error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to review extension request'
      }
    });
  }
};

// =====================================================
// TASK REMARKS CONTROLLERS
// =====================================================

// Add task remark
const addTaskRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark, remark_date, remark_type = 'general', is_private = false } = req.body;
    const added_by = req.user?.id;
    const added_by_type = req.user?.type || 'team';
    
    // Debug logging
    console.log('🔍 Add remark - User info:', {
      userId: added_by,
      userType: added_by_type,
      reqUser: req.user
    });

    // Validate required fields
    if (!remark) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Remark content is required'
        }
      });
    }

    // Check if task exists
    const taskQuery = 'SELECT id FROM tasks WHERE id = ?';
    const tasks = await db.query(taskQuery, [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Use provided date or current date
    const formattedRemarkDate = remark_date ? 
      new Date(remark_date).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];

    // Create remark
    const insertQuery = `
      INSERT INTO task_remarks (
        task_id, added_by, added_by_type, remark_date, remark, remark_type, is_private
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.insert(insertQuery, [
      id, added_by, added_by_type, formattedRemarkDate, remark, remark_type, is_private
    ]);

    console.log('✅ Task remark added:', result.insertId);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        task_id: id,
        remark,
        remark_date: formattedRemarkDate,
        remark_type,
        is_private
      },
      message: 'Remark added successfully'
    });

  } catch (error) {
    console.error('Add task remark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to add remark'
      }
    });
  }
};

// Get task remarks
const getTaskRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user; // Check if user is admin

    let query = `
      SELECT 
        tr.*,
        COALESCE(
          tm.name,
          au.name,
          'Unknown User'
        ) as user_name
      FROM task_remarks tr
      LEFT JOIN team_members tm ON tr.added_by = tm.id
      LEFT JOIN admin_users au ON tr.added_by = au.id
      WHERE tr.task_id = ?
    `;

    const queryParams = [id];

    // If not admin, exclude private remarks
    if (!isAdmin) {
      query += ' AND tr.is_private = 0';
    }

    query += ' ORDER BY tr.remark_date DESC, tr.created_at DESC';

    const remarks = await db.query(query, queryParams);

    res.json({
      success: true,
      data: remarks
    });

  } catch (error) {
    console.error('Get task remarks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch task remarks'
      }
    });
  }
};

// Delete task remark (only by the user who created it or admin)
const deleteTaskRemark = async (req, res) => {
  try {
    const { remarkId } = req.params;

    // Check if remark exists
    const remarkQuery = 'SELECT * FROM task_remarks WHERE id = ?';
    const remarks = await db.query(remarkQuery, [remarkId]);

    if (remarks.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task remark not found'
        }
      });
    }

    // Delete the remark
    await db.query('DELETE FROM task_remarks WHERE id = ?', [remarkId]);

    res.json({
      success: true,
      message: 'Task remark deleted successfully'
    });

  } catch (error) {
    console.error('Delete task remark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete task remark'
      }
    });
  }
};

// Get notifications for admin dashboard
const getNotifications = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Get pending extension requests
    const extensionQuery = `
      SELECT 
        te.id,
        te.task_id,
        te.requested_by,
        te.requested_by_type,
        te.current_due_date,
        te.requested_due_date,
        te.reason,
        te.status,
        te.created_at,
        t.name as task_name,
        p.name as project_name,
        CASE 
          WHEN te.requested_by_type = 'team' THEN tm.name
          WHEN te.requested_by_type = 'admin' THEN au.name
          ELSE 'Unknown User'
        END as requester_name
      FROM task_extensions te
      JOIN tasks t ON te.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN team_members tm ON te.requested_by = tm.id
      LEFT JOIN admin_users au ON te.requested_by = au.id
      WHERE te.status = 'pending'
      ORDER BY te.created_at DESC
    `;
    
    // Get recent remarks (last 7 days)
    const remarksQuery = `
      SELECT 
        tr.id,
        tr.task_id,
        tr.added_by,
        tr.added_by_type,
        tr.remark_date,
        tr.remark,
        tr.remark_type,
        tr.is_private,
        tr.created_at,
        t.name as task_name,
        p.name as project_name,
        CASE 
          WHEN tr.added_by_type = 'team' THEN tm.name
          WHEN tr.added_by_type = 'admin' THEN au.name
          ELSE 'Unknown User'
        END as user_name
      FROM task_remarks tr
      JOIN tasks t ON tr.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN admin_users au ON tr.added_by = au.id
      LEFT JOIN team_members tm ON tr.added_by = tm.id
      WHERE tr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY tr.created_at DESC
      LIMIT 50
    `;
    
    const [extensions, remarks] = await Promise.all([
      db.query(extensionQuery),
      db.query(remarksQuery)
    ]);
    
    // Format the data - db.query returns rows directly, not nested arrays
    const notifications = {
      extensions: extensions.map(ext => ({
        id: ext.id,
        type: 'extension_request',
        task_id: ext.task_id,
        task_name: ext.task_name,
        project_name: ext.project_name,
        requester_name: ext.requester_name,
        requester_type: ext.requested_by_type,
        current_due_date: ext.current_due_date,
        requested_due_date: ext.requested_due_date,
        reason: ext.reason,
        status: ext.status,
        created_at: ext.created_at,
        is_new: true // All pending extensions are considered new
      })),
      remarks: remarks.map(remark => ({
        id: remark.id,
        type: 'remark',
        task_id: remark.task_id,
        task_name: remark.task_name,
        project_name: remark.project_name,
        user_name: remark.user_name,
        user_type: remark.added_by_type,
        remark: remark.remark,
        remark_type: remark.remark_type,
        is_private: remark.is_private,
        created_at: remark.created_at,
        is_new: true // All recent remarks are considered new
      }))
    };
    
    res.json({
      success: true,
      data: notifications
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get notifications for team members
const getTeamNotifications = async (req, res) => {
  try {
    const teamMemberId = req.user.id;
    
    // Get all tasks assigned to this team member
    const tasksQuery = `
      SELECT t.id, t.name as task_name, t.project_id, t.end_date
      FROM tasks t
      JOIN task_assignees ta ON t.id = ta.task_id
      WHERE ta.assignee_id = ? AND ta.assignee_type = 'team'
    `;
    
    const tasks = await db.query(tasksQuery, [teamMemberId]);
    
    if (tasks.length === 0) {
      return res.json({
        success: true,
        data: { extensions: [], remarks: [] }
      });
    }
    
    const taskIds = tasks.map(t => t.id);
    const taskIdsPlaceholder = taskIds.map(() => '?').join(',');
    
    // Get extension requests for team member's tasks (including requests from other team members and admins)
    const extensionQuery = `
      SELECT 
        te.id,
        te.task_id,
        te.requested_by,
        te.requested_by_type,
        te.current_due_date,
        te.requested_due_date,
        te.reason,
        te.status,
        te.created_at,
        te.review_notes,
        te.reviewed_at,
        t.name as task_name,
        p.name as project_name,
        CASE 
          WHEN te.requested_by_type = 'team' THEN tm.name
          WHEN te.requested_by_type = 'admin' THEN au.name
          ELSE 'Unknown User'
        END as requester_name,
        CASE 
          WHEN te.reviewed_by IS NOT NULL THEN admin_reviewer.name
          ELSE NULL
        END as reviewer_name,
        CASE 
          WHEN te.status = 'approved' THEN '✅ Extension Approved'
          WHEN te.status = 'rejected' THEN '❌ Extension Rejected'
          WHEN te.status = 'pending' THEN '⏳ Extension Pending'
          ELSE te.status
        END as status_display
      FROM task_extensions te
      JOIN tasks t ON te.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN team_members tm ON te.requested_by = tm.id
      LEFT JOIN admin_users au ON te.requested_by = au.id
      LEFT JOIN admin_users admin_reviewer ON te.reviewed_by = admin_reviewer.id
      WHERE te.task_id IN (${taskIdsPlaceholder})
      ORDER BY te.created_at DESC
    `;
    
    // Get remarks for team member's tasks (including admin remarks and other team member remarks)
    const remarksQuery = `
      SELECT 
        tr.id,
        tr.task_id,
        tr.added_by,
        tr.added_by_type,
        tr.remark_date,
        tr.remark,
        tr.remark_type,
        tr.is_private,
        tr.created_at,
        t.name as task_name,
        p.name as project_name,
        CASE 
          WHEN tr.added_by_type = 'team' THEN tm.name
          WHEN tr.added_by_type = 'admin' THEN au.name
          ELSE 'Unknown User'
        END as user_name,
        CASE 
          WHEN tr.added_by_type = 'admin' THEN '👑 Admin Remark'
          WHEN tr.added_by_type = 'team' THEN '👤 Team Remark'
          ELSE 'Remark'
        END as remark_type_display
      FROM task_remarks tr
      JOIN tasks t ON tr.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN admin_users au ON tr.added_by = au.id
      LEFT JOIN team_members tm ON tr.added_by = tm.id
      WHERE tr.task_id IN (${taskIdsPlaceholder})
      ORDER BY tr.created_at DESC
    `;
    
    const [extensions, remarks] = await Promise.all([
      db.query(extensionQuery, taskIds),
      db.query(remarksQuery, taskIds)
    ]);
    
    // Format the data for team member notifications
    const notifications = {
      extensions: extensions.map(ext => ({
        id: ext.id,
        type: 'extension_request',
        task_id: ext.task_id,
        task_name: ext.task_name,
        project_name: ext.project_name,
        requester_name: ext.requester_name,
        requester_type: ext.requested_by_type,
        current_due_date: ext.current_due_date,
        requested_due_date: ext.requested_due_date,
        reason: ext.reason,
        status: ext.status,
        created_at: ext.created_at,
        review_notes: ext.review_notes,
        reviewed_at: ext.reviewed_at,
        reviewer_name: ext.reviewer_name,
        is_new: ext.status === 'pending' || 
                (ext.reviewed_at && new Date(ext.reviewed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) // New if pending or reviewed in last 24h
      })),
      remarks: remarks.map(remark => ({
        id: remark.id,
        type: 'remark',
        task_id: remark.task_id,
        task_name: remark.task_name,
        project_name: remark.project_name,
        user_name: remark.user_name,
        user_type: remark.added_by_type,
        remark: remark.remark,
        remark_type: remark.remark_type,
        is_private: remark.is_private,
        created_at: remark.created_at,
        is_new: new Date(remark.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // New if created in last 24h
      }))
    };
    
    res.json({
      success: true,
      data: notifications
    });
    
  } catch (error) {
    console.error('Error fetching team notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team notifications',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  testStageFilter,
  bulkCreateTasks,
  // Extension endpoints
  requestTaskExtension,
  getTaskExtensions,
  reviewExtensionRequest,
  // Remark endpoints
  addTaskRemark,
  getTaskRemarks,
  deleteTaskRemark,
  getNotifications,
  getTeamNotifications
};
