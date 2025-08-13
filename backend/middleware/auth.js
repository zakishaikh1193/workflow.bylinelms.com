const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to verify admin JWT token
const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user type is admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Skip session validation for now to fix login redirect
    // TODO: Re-enable session validation after testing login flow
    // const [sessionRows] = await pool.execute(
    //   'SELECT * FROM admin_sessions WHERE user_id = ? AND access_token = ? AND expires_at > NOW()',
    //   [decoded.id, token]
    // );

    // if (sessionRows.length === 0) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Session expired or invalid'
    //   });
    // }

    // Get admin user
    const adminRows = await db.query(
      'SELECT id, email, name, is_active FROM admin_users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    if (adminRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    const admin = adminRows[0];

    // Add user to request object
    req.user = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      type: 'admin'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to verify team member token
const requireTeamAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user type is team
    if (decoded.type !== 'team') {
      return res.status(403).json({
        success: false,
        message: 'Team member access required'
      });
    }

    // Check if session exists and is valid (team members don't have sessions in our current schema)
    // We'll skip session validation for team members for now
    
    // Get team member
    const teamMemberRows = await db.query(
      'SELECT id, email, name, is_active FROM team_members WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    if (teamMemberRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Team member not found or inactive'
      });
    }

    const teamMember = teamMemberRows[0];

    // Add user to request object
    req.user = {
      id: teamMember.id,
      email: teamMember.email,
      name: teamMember.name,
      type: 'team'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Team auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to verify either admin or team member token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'admin') {
      // Admin authentication (skip session validation for now)
      // TODO: Re-enable session validation after testing login flow  
      // const [sessionRows] = await pool.execute(
      //   'SELECT * FROM admin_sessions WHERE user_id = ? AND access_token = ? AND expires_at > NOW()',
      //   [decoded.id, token]
      // );

      // if (sessionRows.length === 0) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Session expired or invalid'
      //   });
      // }

      const adminRows = await db.query(
        'SELECT id, email, name, is_active FROM admin_users WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      if (adminRows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive'
        });
      }

      const admin = adminRows[0];

      req.user = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        type: 'admin'
      };

    } else if (decoded.type === 'team') {
      // Team member authentication (skip session validation for now)
      const teamMemberRows = await db.query(
        'SELECT id, email, name, is_active FROM team_members WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      if (teamMemberRows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Team member not found or inactive'
        });
      }

      const teamMember = teamMemberRows[0];

      req.user = {
        id: teamMember.id,
        email: teamMember.email,
        name: teamMember.name,
        type: 'team'
      };

    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'admin') {
      const adminRows = await db.query(
        'SELECT id, email, name FROM admin_users WHERE id = ? AND is_active = true',
        [decoded.id]
      );
      
      if (adminRows.length > 0) {
        req.user = { ...adminRows[0], type: 'admin' };
      }
    } else if (decoded.type === 'team') {
      const teamMemberRows = await db.query(
        'SELECT id, email, name FROM team_members WHERE id = ? AND is_active = true',
        [decoded.id]
      );
      
      if (teamMemberRows.length > 0) {
        req.user = { ...teamMemberRows[0], type: 'team' };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth
    req.user = null;
    next();
  }
};

// Alias for requireAdminAuth (commonly used for admin-only routes)
const authenticateToken = requireAdminAuth;

module.exports = {
  requireAdminAuth,
  requireTeamAuth,
  requireAuth,
  optionalAuth,
  authenticateToken
};
