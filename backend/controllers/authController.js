const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

// Helper function to generate team JWT token
function generateTeamToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'team'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

// Helper function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'admin' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// Helper function to generate team refresh token
function generateTeamRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'team' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// Helper function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'admin' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

const authController = {
  // Admin Login
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find admin user by email
      const admin = await db.queryFirst(
        'SELECT * FROM admin_users WHERE email = ? AND is_active = true',
        [email.toLowerCase()]
      );

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const accessToken = generateToken(admin);
      const refreshToken = generateRefreshToken(admin);

      // Update last login
      await db.execute(
        'UPDATE admin_users SET last_login_at = NOW() WHERE id = ?',
        [admin.id]
      );

      // Store session in database
      const sessionId = `admin_${admin.id}_${Date.now()}`;
      await db.execute(
        'INSERT INTO admin_sessions (id, user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [sessionId, admin.id, accessToken, refreshToken]
      );

      // Remove sensitive data
      delete admin.password_hash;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: admin,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 24 * 60 * 60 // 24 hours in seconds
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get current admin profile
  async getAdminProfile(req, res) {
    try {
      const adminId = req.user.id;

      // Get admin with skills
      const admin = await db.queryFirst(`
        SELECT 
          au.*,
          GROUP_CONCAT(s.name) as skills
        FROM admin_users au
        LEFT JOIN admin_user_skills aus ON au.id = aus.user_id
        LEFT JOIN skills s ON aus.skill_id = s.id
        WHERE au.id = ? AND au.is_active = true
        GROUP BY au.id
      `, [adminId]);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Parse skills
      admin.skills = admin.skills ? admin.skills.split(',') : [];
      delete admin.password_hash;

      res.json({
        success: true,
        data: admin
      });

    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  },

  // Refresh admin token
  async refreshAdminToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

      // Check if session exists
      const session = await db.queryFirst(
        'SELECT * FROM admin_sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > NOW()',
        [decoded.id, refresh_token]
      );

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Get admin user
      const admin = await db.queryFirst(
        'SELECT * FROM admin_users WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Generate new tokens
      const newAccessToken = generateToken(admin);
      const newRefreshToken = generateRefreshToken(admin);

      // Update session
      await db.execute(
        'UPDATE admin_sessions SET access_token = ?, refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR), updated_at = NOW() WHERE id = ?',
        [newAccessToken, newRefreshToken, session.id]
      );

      delete admin.password_hash;

      res.json({
        success: true,
        data: {
          user: admin,
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: 24 * 60 * 60
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  },

  // Refresh team member token
  async refreshTeamMemberToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
      
      // Check if session exists and is valid
      const session = await db.queryFirst(
        'SELECT * FROM team_sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > NOW()',
        [decoded.id, refresh_token]
      );

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Get team member data
      const teamMember = await db.queryFirst(
        'SELECT * FROM team_members WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      if (!teamMember) {
        return res.status(401).json({
          success: false,
          message: 'Team member not found or inactive'
        });
      }

      // Generate new tokens
      const newAccessToken = generateTeamToken(teamMember);
      const newRefreshToken = generateTeamRefreshToken(teamMember);

      // Update session with new tokens
      await db.execute(
        'UPDATE team_sessions SET access_token = ?, refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR), updated_at = NOW() WHERE id = ?',
        [newAccessToken, newRefreshToken, session.id]
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: 24 * 60 * 60 // 24 hours in seconds
        }
      });

    } catch (error) {
      console.error('Team refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  },

  // Admin logout
  async adminLogout(req, res) {
    try {
      const adminId = req.user.id;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        // Remove session from database
        await db.execute(
          'DELETE FROM admin_sessions WHERE user_id = ? AND access_token = ?',
          [adminId, token]
        );
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  // Logout from all devices
  async adminLogoutAll(req, res) {
    try {
      const adminId = req.user.id;

      // Remove all sessions for this admin
      await db.execute(
        'DELETE FROM admin_sessions WHERE user_id = ?',
        [adminId]
      );

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('Admin logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  // Team Member Login (simple passcode-based)
  async teamMemberLogin(req, res) {
    try {
      const { email, passcode } = req.body;

      // Validation
      if (!email || !passcode) {
        return res.status(400).json({
          success: false,
          message: 'Email and passcode are required'
        });
      }

      // Find team member
      const teamMember = await db.queryFirst(`
        SELECT 
          tm.*,
          GROUP_CONCAT(s.name) as skills
        FROM team_members tm
        LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
        LEFT JOIN skills s ON tms.skill_id = s.id
        WHERE tm.email = ? AND tm.passcode = ? AND tm.is_active = true
        GROUP BY tm.id
      `, [email.toLowerCase(), passcode]);

      if (!teamMember) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or passcode'
        });
      }

      // Get performance flags
      const performanceFlags = await db.query(
        'SELECT * FROM performance_flags WHERE team_member_id = ? ORDER BY created_at DESC',
        [teamMember.id]
      );

      // Generate session token (simple token for team members)
      const sessionToken = jwt.sign(
        {
          id: teamMember.id,
          email: teamMember.email,
          name: teamMember.name,
          type: 'team'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create session record
      const sessionId = `team_${teamMember.id}_${Date.now()}`;
      await db.execute(
        'INSERT INTO team_member_sessions (id, team_member_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [sessionId, teamMember.id]
      );

      // Update last login
      await db.execute(
        'UPDATE team_members SET last_login_at = NOW() WHERE id = ?',
        [teamMember.id]
      );

      // Parse skills and prepare response
      teamMember.skills = teamMember.skills ? teamMember.skills.split(',') : [];
      teamMember.performance_flags = performanceFlags;
      delete teamMember.passcode; // Don't send passcode back

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: teamMember,
          session_token: sessionToken,
          expires_in: 24 * 60 * 60
        }
      });

    } catch (error) {
      console.error('Team member login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  },

  // Team Member logout
  async teamMemberLogout(req, res) {
    try {
      const teamMemberId = req.user.id;

      // Remove session
      await db.execute(
        'DELETE FROM team_member_sessions WHERE team_member_id = ?',
        [teamMemberId]
      );

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Team member logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }
};

module.exports = authController;
