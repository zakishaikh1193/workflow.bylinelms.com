# API Endpoints Documentation
## Workflow LMS Backend API

### Base URL: `http://localhost:3001/api`

---

## 🔐 Authentication Endpoints

### Admin Authentication
```
POST   /auth/admin/login          # Admin login with email/password
POST   /auth/admin/refresh        # Refresh admin token
POST   /auth/admin/logout         # Admin logout
GET    /auth/admin/me             # Get current admin profile
```

### Team Member Authentication
```
POST   /auth/team/login           # Team member login with email/passcode
POST   /auth/team/logout          # Team member logout
GET    /auth/team/me              # Get current team member profile
```

---

## 👥 User Management

### Admin Users
```
GET    /users/admin               # Get all admin users
POST   /users/admin               # Create new admin user
GET    /users/admin/:id           # Get specific admin user
PUT    /users/admin/:id           # Update admin user
DELETE /users/admin/:id           # Delete admin user
PUT    /users/admin/:id/skills    # Update admin user skills
```

### Team Members
```
GET    /users/team                # Get all team members
POST   /users/team                # Create new team member
GET    /users/team/:id            # Get specific team member
PUT    /users/team/:id            # Update team member
DELETE /users/team/:id            # Delete team member
PUT    /users/team/:id/skills     # Update team member skills
```

### Performance Flags
```
GET    /users/team/:id/flags      # Get team member performance flags
POST   /users/team/:id/flags      # Add performance flag
DELETE /flags/:flagId             # Remove performance flag
```

---

## 📊 Project Management

### Projects
```
GET    /projects                  # Get all projects (with filters)
POST   /projects                  # Create new project
GET    /projects/:id              # Get project details
PUT    /projects/:id              # Update project
DELETE /projects/:id              # Delete project
GET    /projects/:id/progress     # Get project progress calculation
```

### Project Members
```
GET    /projects/:id/members      # Get project team members
POST   /projects/:id/members      # Add team member to project
DELETE /projects/:id/members/:memberId  # Remove member from project
PUT    /projects/:id/members/:memberId/role  # Update member role
```

### Project Categories
```
GET    /categories                # Get all project categories
POST   /categories                # Create new category
PUT    /categories/:id            # Update category
DELETE /categories/:id            # Delete category
```

---

## 🎯 Educational Content Hierarchy

### Grades
```
GET    /projects/:projectId/grades           # Get all grades for project
POST   /projects/:projectId/grades           # Create new grade
GET    /grades/:id                           # Get grade details
PUT    /grades/:id                           # Update grade
DELETE /grades/:id                           # Delete grade
POST   /grades/distribute-weights            # Auto-distribute weights
```

### Books
```
GET    /grades/:gradeId/books                # Get all books for grade
POST   /grades/:gradeId/books                # Create new book
GET    /books/:id                            # Get book details
PUT    /books/:id                            # Update book
DELETE /books/:id                            # Delete book
```

### Units
```
GET    /books/:bookId/units                  # Get all units for book
POST   /books/:bookId/units                  # Create new unit
GET    /units/:id                            # Get unit details
PUT    /units/:id                            # Update unit
DELETE /units/:id                            # Delete unit
```

### Lessons
```
GET    /units/:unitId/lessons                # Get all lessons for unit
POST   /units/:unitId/lessons                # Create new lesson
GET    /lessons/:id                          # Get lesson details
PUT    /lessons/:id                          # Update lesson
DELETE /lessons/:id                          # Delete lesson
```

---

## 🏗️ Stages & Workflow

### Stages
```
GET    /projects/:projectId/stages           # Get all stages for project
POST   /projects/:projectId/stages           # Create new stage
GET    /stages/:id                           # Get stage details
PUT    /stages/:id                           # Update stage
DELETE /stages/:id                           # Delete stage
GET    /stages/templates/:categoryId         # Get stage templates for category
```

### Review Rounds
```
GET    /stages/:stageId/reviews              # Get review rounds for stage
POST   /stages/:stageId/reviews              # Create new review round
GET    /reviews/:id                          # Get review round details
PUT    /reviews/:id                          # Update review round
DELETE /reviews/:id                          # Delete review round
```

### Review Round Reviewers
```
GET    /reviews/:reviewId/reviewers          # Get reviewers for review round
POST   /reviews/:reviewId/reviewers          # Add reviewer to review round
DELETE /reviews/:reviewId/reviewers/:reviewerId  # Remove reviewer
```

---

## ✅ Task Management

### Tasks
```
GET    /tasks                                # Get all tasks (with filters)
POST   /tasks                                # Create new task
GET    /tasks/:id                            # Get task details
PUT    /tasks/:id                            # Update task
DELETE /tasks/:id                            # Delete task
GET    /projects/:projectId/tasks            # Get tasks for project
GET    /users/:userId/tasks                  # Get tasks for user
PUT    /tasks/:id/progress                   # Update task progress
PUT    /tasks/:id/status                     # Update task status
```

### Task Assignees
```
GET    /tasks/:taskId/assignees              # Get task assignees
POST   /tasks/:taskId/assignees              # Assign user to task
DELETE /tasks/:taskId/assignees/:assigneeId # Remove assignee from task
```

### Task Skills
```
GET    /tasks/:taskId/skills                 # Get required skills for task
PUT    /tasks/:taskId/skills                 # Update required skills for task
```

---

## 📅 Resource Planning

### Team Allocations
```
GET    /allocations                          # Get all allocations (with filters)
POST   /allocations                          # Create new allocation
GET    /allocations/:id                      # Get allocation details
PUT    /allocations/:id                      # Update allocation
DELETE /allocations/:id                      # Delete allocation
GET    /users/:userId/allocations            # Get allocations for user
GET    /projects/:projectId/allocations      # Get allocations for project
```

---

## 🛠️ Skills & Settings

### Skills
```
GET    /skills                               # Get all skills
POST   /skills                               # Create new skill
PUT    /skills/:id                           # Update skill
DELETE /skills/:id                           # Delete skill
```

### Functional Units
```
GET    /functional-units                     # Get all functional units
POST   /functional-units                     # Create new functional unit
GET    /functional-units/:id                 # Get functional unit details
PUT    /functional-units/:id                 # Update functional unit
DELETE /functional-units/:id                 # Delete functional unit
```

---

## 📈 Analytics & Reports

### Dashboard Data
```
GET    /dashboard/stats                      # Get dashboard statistics
GET    /dashboard/overdue-tasks              # Get overdue tasks
GET    /dashboard/due-today                  # Get tasks due today
GET    /dashboard/due-tomorrow               # Get tasks due tomorrow
GET    /dashboard/due-this-week              # Get tasks due this week
```

### Analytics
```
GET    /analytics/project-progress           # Project progress analytics
GET    /analytics/team-performance           # Team performance analytics
GET    /analytics/workload-distribution      # Workload distribution
GET    /analytics/completion-rates           # Task completion rates
GET    /analytics/time-tracking              # Time tracking analytics
```

### Reports
```
GET    /reports/project/:projectId           # Generate project report
GET    /reports/team-member/:memberId        # Generate team member report
GET    /reports/time-summary                 # Generate time summary report
POST   /reports/custom                       # Generate custom report
```

---

## 🔍 Search & Filters

### Search
```
GET    /search/projects                      # Search projects
GET    /search/tasks                         # Search tasks
GET    /search/users                         # Search users
GET    /search/global                        # Global search across all entities
```

### Filters
```
GET    /filters/projects                     # Get available project filters
GET    /filters/tasks                        # Get available task filters
GET    /filters/users                        # Get available user filters
```

---

## 📤 Data Export/Import

### Export
```
GET    /export/projects/:projectId           # Export project data
GET    /export/tasks                         # Export tasks data
GET    /export/team-members                  # Export team members data
POST   /export/custom                        # Custom data export
```

### Import
```
POST   /import/projects                      # Import projects
POST   /import/tasks                         # Import tasks
POST   /import/team-members                  # Import team members
```

---

## 🔔 Notifications (Future Enhancement)

### Notifications
```
GET    /notifications                        # Get user notifications
POST   /notifications/mark-read/:id          # Mark notification as read
POST   /notifications/mark-all-read          # Mark all notifications as read
DELETE /notifications/:id                    # Delete notification
```

---

## ⚙️ System Settings

### Settings
```
GET    /settings                             # Get system settings
PUT    /settings                             # Update system settings
GET    /settings/email                       # Get email settings
PUT    /settings/email                       # Update email settings
```

---

## 📊 Request/Response Formats

### Standard Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination Format
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔒 Authentication Headers

### Admin API Calls
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

### Team Member API Calls
```
Authorization: Bearer <team_session_token>
Content-Type: application/json
```

---

## 📝 Query Parameters

### Common Filters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (e.g., 'name', 'created_at')
- `order` - Sort order ('asc' or 'desc')
- `search` - Search query
- `status` - Filter by status
- `category` - Filter by category
- `assignee` - Filter by assignee
- `date_from` - Start date filter
- `date_to` - End date filter

### Example
```
GET /tasks?page=1&limit=20&sort=due_date&order=asc&status=in-progress&assignee=5
```
