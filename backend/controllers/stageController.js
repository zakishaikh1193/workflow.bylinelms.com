const db = require('../db');

// Get all stages (optionally filtered by project)
const getStages = async (req, res) => {
  try {
    const { project_id } = req.query;

    let query = 'SELECT * FROM stages';
    const queryParams = [];

    if (project_id) {
      query += ' WHERE project_id = ?';
      queryParams.push(project_id);
    }

    query += ' ORDER BY order_index ASC, created_at ASC';

    const stages = await db.query(query, queryParams);

    res.json({
      success: true,
      data: stages
    });

  } catch (error) {
    console.error('Get stages error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch stages'
      }
    });
  }
};

// Get stage by ID
const getStage = async (req, res) => {
  try {
    const { id } = req.params;

    const stages = await db.query('SELECT * FROM stages WHERE id = ?', [id]);

    if (stages.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Stage not found'
        }
      });
    }

    res.json({
      success: true,
      data: stages[0]
    });

  } catch (error) {
    console.error('Get stage error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch stage'
      }
    });
  }
};

// Create new stage
const createStage = async (req, res) => {
  try {
    const {
      project_id,
      name,
      description,
      order_index = 0,
      weight = 0,
      start_date,
      end_date
    } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID and name are required'
        }
      });
    }

    const insertQuery = `
      INSERT INTO stages (project_id, name, description, order_index, weight, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      project_id, 
      name, 
      description, 
      order_index, 
      weight,
      start_date ? new Date(start_date).toISOString().split('T')[0] : null,
      end_date ? new Date(end_date).toISOString().split('T')[0] : null
    ];

    const result = await db.insert(insertQuery, params);
    
    // Get the created stage
    const createdStage = await db.query('SELECT * FROM stages WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: createdStage[0],
      message: 'Stage created successfully'
    });

  } catch (error) {
    console.error('Create stage error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create stage'
      }
    });
  }
};

module.exports = {
  getStages,
  getStage,
  createStage
};
