const db = require('../db');

// Get all grades for a project
const getGradesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const query = `
      SELECT g.*, 
             0 as book_count,
             0 as unit_count,
             0 as lesson_count
      FROM grades g
      WHERE g.project_id = ?
      ORDER BY g.order_index ASC, g.name ASC
    `;
    
    const grades = await db.query(query, [projectId]);
    
    // Transform data to ensure proper types
    const transformedGrades = grades.map(grade => ({
      ...grade,
      weight: parseFloat(grade.weight) || 0,
      order_index: parseInt(grade.order_index) || 0,
      project_id: parseInt(grade.project_id) || 0,
      id: parseInt(grade.id) || 0
    }));
    
    res.json({
      success: true,
      data: transformedGrades,
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching grades by project:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch grades',
        details: error.message
      }
    });
  }
};

// Get all grades
const getAllGrades = async (req, res) => {
  try {
    const query = `
      SELECT g.*, p.name as project_name,
             COUNT(DISTINCT b.id) as book_count
      FROM grades g
      LEFT JOIN projects p ON g.project_id = p.id
      LEFT JOIN books b ON g.id = b.grade_id
      GROUP BY g.id
      ORDER BY g.project_id, g.order_index ASC
    `;
    
    const grades = await db.query(query);
    
    // Transform data to ensure proper types
    const transformedGrades = grades.map(grade => ({
      ...grade,
      weight: parseFloat(grade.weight) || 0,
      order_index: parseInt(grade.order_index) || 0,
      project_id: parseInt(grade.project_id) || 0,
      id: parseInt(grade.id) || 0
    }));
    
    res.json({
      success: true,
      data: transformedGrades,
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching all grades:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch grades',
        details: error.message
      }
    });
  }
};

// Get grade by ID
const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT g.*, p.name as project_name
      FROM grades g
      LEFT JOIN projects p ON g.project_id = p.id
      WHERE g.id = ?
    `;
    
    const grades = await db.query(query, [id]);
    
    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found'
        }
      });
    }
    
    // Transform data to ensure proper types
    const transformedGrade = {
      ...grades[0],
      weight: parseFloat(grades[0].weight) || 0,
      order_index: parseInt(grades[0].order_index) || 0,
      project_id: parseInt(grades[0].project_id) || 0,
      id: parseInt(grades[0].id) || 0
    };
    
    res.json({
      success: true,
      data: transformedGrade,
      message: 'Grade retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching grade by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch grade',
        details: error.message
      }
    });
  }
};

// Create new grade
const createGrade = async (req, res) => {
  try {
    const { project_id, name, description, order_index, weight } = req.body;
    
    // Validate required fields
    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Project ID and name are required'
        }
      });
    }
    
    // Check if project exists
    const projects = await db.query('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Project not found'
        }
      });
    }
    
    // Get next order index if not provided
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const maxOrder = await db.query(
        'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM grades WHERE project_id = ?',
        [project_id]
      );
      finalOrderIndex = maxOrder[0].next_order;
    }
    
    const query = `
      INSERT INTO grades (project_id, name, description, order_index, weight)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await db.insert(query, [
      project_id,
      name,
      description || null,
      finalOrderIndex,
      weight || 0
    ]);
    
    // Fetch the created grade
    const newGrade = await db.query('SELECT * FROM grades WHERE id = ?', [result.insertId]);
    
    // Transform data to ensure proper types
    const transformedGrade = {
      ...newGrade[0],
      weight: parseFloat(newGrade[0].weight) || 0,
      order_index: parseInt(newGrade[0].order_index) || 0,
      project_id: parseInt(newGrade[0].project_id) || 0,
      id: parseInt(newGrade[0].id) || 0
    };
    
    res.status(201).json({
      success: true,
      data: transformedGrade,
      message: 'Grade created successfully'
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create grade',
        details: error.message
      }
    });
  }
};

  // Update grade
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order_index, weight } = req.body;
    
    // Check if grade exists
    const existingGrades = await db.query('SELECT * FROM grades WHERE id = ?', [id]);
    if (existingGrades.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found'
        }
      });
    }
    
    const query = `
      UPDATE grades 
      SET name = ?, description = ?, order_index = ?, weight = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.execute(query, [
      name || existingGrades[0].name,
      description !== undefined ? description : existingGrades[0].description,
      order_index !== undefined ? order_index : existingGrades[0].order_index,
      weight !== undefined ? weight : existingGrades[0].weight,
      id
    ]);
    
    // Fetch the updated grade
    const updatedGrade = await db.query('SELECT * FROM grades WHERE id = ?', [id]);
    
    // Transform data to ensure proper types
    const transformedGrade = {
      ...updatedGrade[0],
      weight: parseFloat(updatedGrade[0].weight) || 0,
      order_index: parseInt(updatedGrade[0].order_index) || 0,
      project_id: parseInt(updatedGrade[0].project_id) || 0,
      id: parseInt(updatedGrade[0].id) || 0
    };
    
    res.json({
      success: true,
      data: transformedGrade,
      message: 'Grade updated successfully'
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update grade',
        details: error.message
      }
    });
  }
};

  // Delete grade
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if grade exists
    const existingGrades = await db.query('SELECT * FROM grades WHERE id = ?', [id]);
    if (existingGrades.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found'
        }
      });
    }
    
    // Check if grade has books (cascade will handle the rest)
    const books = await db.query('SELECT COUNT(*) as count FROM books WHERE grade_id = ?', [id]);
    if (books[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete grade with existing books. Please delete books first.'
        }
      });
    }
    
    await db.execute('DELETE FROM grades WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete grade',
        details: error.message
      }
    });
  }
};

// Auto-distribute weights for grades in a project
const distributeWeights = async (req, res) => {
  try {
    const { project_id } = req.body;
    
    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Project ID is required'
        }
      });
    }
    
    // Get all grades for the project
    const grades = await db.query('SELECT id FROM grades WHERE project_id = ? ORDER BY order_index', [project_id]);
    
    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No grades found for this project'
        }
      });
    }
    
    // Calculate equal weight distribution
    const equalWeight = 100 / grades.length;
    
    // Update all grades with equal weight
    for (const grade of grades) {
      await db.execute('UPDATE grades SET weight = ? WHERE id = ?', [equalWeight, grade.id]);
    }
    
    res.json({
      success: true,
      message: `Weights distributed equally (${equalWeight.toFixed(2)}% each) among ${grades.length} grades`
    });
  } catch (error) {
    console.error('Error distributing weights:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to distribute weights',
        details: error.message
      }
    });
  }
};

module.exports = {
  getGradesByProject,
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  distributeWeights
};
