const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class NotificationServer {
  constructor(server) {
    this.io = new Server(server, {
      path: '/api/socket.io/',
      cors: {
        origin: [
          "http://localhost:5173",
          "https://workflow.bylinelms.com",
          "https://www.workflow.bylinelms.com"
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      },
      allowEIO3: true
    });
    
    this.adminSockets = new Map(); // Map admin IDs to socket IDs
    this.teamSockets = new Map();  // Map team member IDs to socket IDs
    
    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🚀 WebSocket notification server initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userType = decoded.type;
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.userId} (${socket.userType})`);
      
      // Store socket reference based on user type
      if (socket.userType === 'admin') {
        this.adminSockets.set(socket.userId, socket.id);
        console.log(`👑 Admin ${socket.userId} connected`);
      } else if (socket.userType === 'team') {
        this.teamSockets.set(socket.userId, socket.id);
        console.log(`👤 Team member ${socket.userId} connected`);
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.userId} (${socket.userType})`);
        
        if (socket.userType === 'admin') {
          this.adminSockets.delete(socket.userId);
        } else if (socket.userType === 'team') {
          this.teamSockets.delete(socket.userId);
        }
      });

      // Handle admin joining specific project rooms
      socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
        console.log(`👑 Admin ${socket.userId} joined project ${projectId}`);
      });

      // Handle team member joining their assigned project rooms
      socket.on('join-assigned-projects', (projectIds) => {
        console.log(`🔗 Team member ${socket.userId} attempting to join projects:`, projectIds);
        projectIds.forEach(projectId => {
          socket.join(`project-${projectId}`);
          console.log(`✅ Team member ${socket.userId} joined project room: project-${projectId}`);
        });
        console.log(`👤 Team member ${socket.userId} joined ${projectIds.length} projects`);
      });
    });
  }

  // Broadcast notification to all admins
  broadcastToAdmins(event, data) {
    this.adminSockets.forEach((socketId, adminId) => {
      this.io.to(socketId).emit(event, data);
    });
    console.log(`📢 Broadcasted ${event} to ${this.adminSockets.size} admins`);
  }

  // Get connected clients count
  getConnectedClients() {
    return this.adminSockets.size + this.teamSockets.size;
  }

  // Broadcast notification to specific project room
  broadcastToProject(projectId, event, data) {
    this.io.to(`project-${projectId}`).emit(event, data);
    console.log(`📢 Broadcasted ${event} to project ${projectId}`);
  }

  // Send notification to specific user
  sendToUser(userId, userType, event, data) {
    const socketId = userType === 'admin' 
      ? this.adminSockets.get(userId)
      : this.teamSockets.get(userId);
    
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      console.log(`📱 Sent ${event} to ${userType} ${userId}`);
    } else {
      console.log(`⚠️ User ${userId} (${userType}) not connected`);
    }
  }

  // Notify all team members assigned to a specific task
  async notifyTaskAssignees(taskId, event, data) {
    try {
      // Import db here to avoid circular dependency
      const db = require('./db');
      
      // Get all assignees for this specific task
      const assigneesQuery = `
        SELECT ta.assignee_id, ta.assignee_type
        FROM task_assignees ta
        WHERE ta.task_id = ?
      `;
      
      const assignees = await db.query(assigneesQuery, [taskId]);
      
      console.log(`📋 Found ${assignees.length} assignees for task ${taskId}:`, assignees);
      
      // Send notification to each assignee
      for (const assignee of assignees) {
        if (assignee.assignee_type === 'team') {
          // Send to team member
          this.sendToUser(assignee.assignee_id, 'team', event, data);
        } else if (assignee.assignee_type === 'admin') {
          // Send to admin (though they already get it via broadcastToAdmins)
          this.sendToUser(assignee.assignee_id, 'admin', event, data);
        }
      }
      
      console.log(`📢 Task assignee notification: ${event} sent to ${assignees.length} assignees for task ${taskId}`);
    } catch (error) {
      console.error('Error notifying task assignees:', error);
    }
  }

  // Notify about new extension request
  async notifyExtensionRequest(extensionData) {
    const notification = {
      type: 'extension_request',
      title: 'New Extension Request',
      message: `${extensionData.requester_name} requested an extension for "${extensionData.task_name}"`,
      data: extensionData,
      timestamp: new Date().toISOString(),
      priority: 'high'
    };

    // Broadcast to all admins (they can see all extension requests)
    this.broadcastToAdmins('new-notification', notification);
    
    // Get task assignees and notify only them
    await this.notifyTaskAssignees(extensionData.task_id, 'new-notification', notification);
    
    console.log(`📢 Extension notification sent to ${this.adminSockets.size} admins and task assignees for task ${extensionData.task_id}`);
  }

  // Notify about new remark
  async notifyNewRemark(remarkData) {
    const notification = {
      type: 'new_remark',
      title: 'New Task Remark',
      message: `${remarkData.user_name} added a remark to "${remarkData.task_name}"`,
      data: remarkData,
      timestamp: new Date().toISOString(),
      priority: 'medium'
    };

    // Broadcast to all admins (they can see all remarks)
    this.broadcastToAdmins('new-notification', notification);
    
    // Get task assignees and notify only them
    await this.notifyTaskAssignees(remarkData.task_id, 'new-notification', notification);
    
    console.log(`📢 Remark notification sent to ${this.adminSockets.size} admins and task assignees for task ${remarkData.task_id}`);
  }

  // Notify about extension review (to team member)
  async notifyExtensionReview(extensionData) {
    const notification = {
      type: 'extension_reviewed',
      title: 'Extension Request Reviewed',
      message: `Extension request for "${extensionData.task_name}" has been ${extensionData.status}`,
      data: extensionData,
      timestamp: new Date().toISOString(),
      priority: extensionData.status === 'approved' ? 'low' : 'high'
    };

    // Send to the team member who requested the extension
    this.sendToUser(extensionData.requested_by, extensionData.requested_by_type, 'new-notification', notification);
    
    // Also notify other team members assigned to the same task
    await this.notifyTaskAssignees(extensionData.task_id, 'new-notification', notification);
    
    console.log(`📢 Extension review notification sent to requester and task assignees for task ${extensionData.task_id}`);
  }

  // Notify about task submission for review (to admins)
  async notifyTaskSubmission(submissionData) {
    const notification = {
      type: 'task_under_review',
      title: 'Task Submitted for Review',
      message: `${submissionData.user_name} submitted "${submissionData.task_name}" for review`,
      description: `Hierarchy: ${submissionData.hierarchy}\nStage: ${submissionData.stage_name}`,
      data: submissionData,
      timestamp: new Date().toISOString(),
      priority: 'high'
    };

    // Broadcast to all admins (they should know about task submissions)
    this.broadcastToAdmins('new-notification', notification);
    
    // Also notify other team members assigned to the same task
    await this.notifyTaskAssignees(submissionData.task_id, 'new-notification', notification);
    
    console.log(`📢 Task submission notification sent to ${this.adminSockets.size} admins and task assignees for task ${submissionData.task_id}`);
  }

  // Notify about task completion (to admins)
  async notifyTaskCompletion(completionData) {
    const notification = {
      type: 'task_completed',
      title: 'Task Completed',
      message: `${completionData.user_name} has marked "${completionData.task_name}" as completed`,
      description: `Hierarchy: ${completionData.hierarchy}\nStage: ${completionData.stage_name}`,
      data: completionData,
      timestamp: new Date().toISOString(),
      priority: 'medium'
    };

    // Broadcast to all admins (they should know about task completions)
    this.broadcastToAdmins('new-notification', notification);
    
    // Also notify other team members assigned to the same task
    await this.notifyTaskAssignees(completionData.task_id, 'new-notification', notification);
    
    console.log(`📢 Task completion notification sent to ${this.adminSockets.size} admins and task assignees for task ${completionData.task_id}`);
  }

  // Notify about task review (approve/deny)
  async notifyTaskReview(reviewData) {
    const notification = {
      type: 'task_reviewed',
      title: `Task ${reviewData.action === 'approve' ? 'Approved ✅' : 'Denied ❌'}`,
      message: reviewData.action === 'approve' 
        ? `Admin has approved your task "${reviewData.task_name}" and it is now marked as complete!`
        : `Admin has denied your task "${reviewData.task_name}". Please make the necessary changes and resubmit.`,
      description: reviewData.action === 'approve' 
        ? `Congratulations! Your task has been approved by ${reviewData.reviewer_name} and marked as completed.` 
        : `Your task has been denied by ${reviewData.reviewer_name}. Please review the feedback and make necessary changes before resubmitting.`,
      data: reviewData,
      timestamp: new Date().toISOString(),
      priority: reviewData.action === 'approve' ? 'high' : 'medium'
    };

    // Send to specific team member using the sendToUser method
    console.log(`🔍 Debug: Attempting to send task review notification to team member ${reviewData.assignee_name} (ID: ${reviewData.assignee_id})`);
    console.log(`🔍 Debug: Current team sockets:`, Array.from(this.teamSockets.keys()));
    this.sendToUser(reviewData.assignee_id.toString(), 'team', 'new-notification', notification);
    console.log(`📢 Task review notification sent to team member ${reviewData.assignee_name} (ID: ${reviewData.assignee_id})`);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return {
      admins: this.adminSockets.size,
      teamMembers: this.teamSockets.size,
      total: this.adminSockets.size + this.teamSockets.size
    };
  }
}

module.exports = NotificationServer;
