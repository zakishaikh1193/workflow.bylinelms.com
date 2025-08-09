# Workflow LMS Migration Guide
## From Supabase to Node.js Express + MySQL

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Changes](#architecture-changes)
3. [Database Migration](#database-migration)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Changes](#frontend-changes)
6. [Authentication Changes](#authentication-changes)
7. [Implementation Steps](#implementation-steps)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)

---

## 🎯 Overview

This migration transforms the Workflow LMS application from a Supabase-based architecture to a traditional Node.js Express backend with MySQL database, while maintaining all existing functionality.

### Current Architecture (Supabase)
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: Supabase Auth + Custom team member auth

### Target Architecture (Express + MySQL)
- **Frontend**: React + TypeScript + Vite (unchanged)
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MySQL with auto-increment integer IDs
- **Authentication**: JWT-based for admins + Session-based for team members

---

## 🏗️ Architecture Changes

### Database Changes
| Component | Current (Supabase) | New (MySQL) |
|-----------|-------------------|-------------|
| Primary Keys | UUID | Auto-increment INT |
| User Auth | Supabase auth.users | Custom admin_users table |
| Team Auth | Custom team_members + RPC | team_members + sessions |
| Security | Row Level Security (RLS) | Application-level security |
| Relationships | Foreign key UUIDs | Foreign key INTs |

### Authentication Changes
| User Type | Current | New |
|-----------|---------|-----|
| Admin Users | Supabase Auth | JWT-based authentication |
| Team Members | Passcode + RPC function | Passcode + session tokens |

### API Changes
| Current | New |
|---------|-----|
| Supabase client direct DB calls | REST API endpoints |
| Real-time subscriptions | Polling or WebSocket (optional) |
| RLS policies | Route-level middleware |

---

## 🗄️ Database Migration

### 1. Schema Conversion

#### Key Changes:
- **UUIDs → Auto-increment INTs**: All primary keys changed from UUID to integer
- **Timestamp columns**: PostgreSQL `timestamptz` → MySQL `TIMESTAMP`
- **Foreign key updates**: All reference tables updated to use INT IDs
- **Check constraints**: PostgreSQL CHECK → MySQL ENUM where applicable

#### Major Table Mappings:

| PostgreSQL (Supabase) | MySQL (New) | Changes |
|------------------------|-------------|---------|
| `profiles` | `admin_users` | Added password_hash, removed auth.users reference |
| `team_members` | `team_members` | Minimal changes, added session tracking |
| `projects` | `projects` | UUID → INT conversion |
| `tasks` | `tasks` | Added component relationship fields |
| `user_skills` | `admin_user_skills` + `team_member_skills` | Split into separate tables |

### 2. Data Migration Script

```sql
-- Example data migration from PostgreSQL to MySQL
-- Note: This requires a custom migration script due to UUID → INT conversion

-- 1. Export data from Supabase
-- 2. Create ID mapping tables
-- 3. Transform UUIDs to sequential integers
-- 4. Update all foreign key references
-- 5. Import to MySQL with proper relationships
```

### 3. New Tables Added

- `admin_sessions` - JWT session management
- `team_member_sessions` - Team member session tracking
- `functional_units` - Organizational units
- `stage_templates` - Predefined stage templates
- `functional_unit_skills` - Unit-skill relationships

---

## 🚀 Backend Implementation

### 1. Project Structure
```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Authentication, validation, etc.
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── database/
│   ├── schema.sql         # Database schema
│   ├── seeds/             # Sample data
│   └── migrations/        # Database migrations
├── tests/                 # Test files
├── package.json
├── tsconfig.json
└── .env.example
```

### 2. Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/cors": "^2.8.13",
    "@types/multer": "^1.4.7",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "@types/jest": "^29.5.3"
  }
}
```

### 3. Key Services to Implement

#### Authentication Service
```typescript
// services/authService.ts
export class AuthService {
  static async loginAdmin(email: string, password: string)
  static async registerAdmin(userData: CreateAdminUser)
  static async refreshToken(refreshToken: string)
  static async loginTeamMember(email: string, passcode: string)
  static async generateJWT(user: AdminUser)
  static async verifyJWT(token: string)
}
```

#### Project Service
```typescript
// services/projectService.ts
export class ProjectService {
  static async getAllProjects(filters: ProjectFilters)
  static async getProjectById(id: number)
  static async createProject(projectData: CreateProject)
  static async updateProject(id: number, updates: UpdateProject)
  static async deleteProject(id: number)
  static async calculateProgress(projectId: number)
}
```

#### Task Service
```typescript
// services/taskService.ts
export class TaskService {
  static async getAllTasks(filters: TaskFilters)
  static async getTaskById(id: number)
  static async createTask(taskData: CreateTask)
  static async updateTask(id: number, updates: UpdateTask)
  static async deleteTask(id: number)
  static async assignUsers(taskId: number, assignees: Assignee[])
}
```

---

## 🎨 Frontend Changes

### 1. Service Layer Updates

#### Current Supabase Services
```typescript
// OLD: src/services/database.ts
export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    return data;
  }
}
```

#### New REST API Services
```typescript
// NEW: src/services/api.ts
class ApiService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
}

export const projectService = {
  async getAll() {
    return apiService.get('/projects');
  }
}
```

### 2. Authentication Hook Updates

#### Current useAuth Hook
```typescript
// OLD: Uses Supabase auth
const { user, session } = useAuth();
```

#### New useAuth Hook
```typescript
// NEW: Uses JWT tokens
const { user, token, isAuthenticated } = useAuth();
```

### 3. Environment Variables
```bash
# OLD: .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# NEW: .env
VITE_API_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

---

## 🔐 Authentication Changes

### 1. Admin Authentication Flow

#### Current (Supabase)
1. User enters email/password
2. Supabase handles authentication
3. Returns user object + session
4. Session automatically managed

#### New (JWT)
1. User enters email/password
2. POST to `/api/auth/admin/login`
3. Server validates credentials
4. Returns JWT access + refresh tokens
5. Frontend stores tokens in localStorage
6. Include token in all API requests

### 2. Team Member Authentication Flow

#### Current (Supabase RPC)
1. User enters email/passcode
2. Call Supabase RPC function
3. Function validates and returns user data

#### New (Session-based)
1. User enters email/passcode
2. POST to `/api/auth/team/login`
3. Server validates credentials
4. Creates session record in database
5. Returns session token
6. Token used for subsequent requests

### 3. Security Middleware

```typescript
// middleware/auth.ts
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🛠️ Implementation Steps

### Phase 1: Database Setup (Week 1)
1. **Day 1-2**: Set up MySQL database
   - Create MySQL instance
   - Run schema.sql script
   - Verify all tables and relationships
   
2. **Day 3-4**: Data migration script
   - Export data from Supabase
   - Create UUID to INT mapping
   - Transform and import data
   
3. **Day 5**: Validate data integrity
   - Verify all relationships
   - Test data consistency
   - Performance testing

### Phase 2: Backend Development (Week 2-3)
1. **Day 1-3**: Core backend setup
   - Initialize Express.js project
   - Set up TypeScript configuration
   - Implement database connection
   - Create base middleware
   
2. **Day 4-7**: Authentication system
   - Implement JWT authentication
   - Create admin auth endpoints
   - Create team member auth endpoints
   - Implement session management
   
3. **Day 8-10**: Core API endpoints
   - User management endpoints
   - Project management endpoints
   - Category and skills endpoints
   
4. **Day 11-14**: Advanced features
   - Task management endpoints
   - Educational content hierarchy
   - Team allocation endpoints
   - Analytics endpoints

### Phase 3: Frontend Integration (Week 4)
1. **Day 1-2**: Service layer update
   - Replace Supabase client with REST API calls
   - Update authentication hooks
   - Update all service functions
   
2. **Day 3-4**: Component updates
   - Update forms to use new API
   - Fix any breaking changes
   - Update error handling
   
3. **Day 5**: Testing and bug fixes
   - End-to-end testing
   - Fix integration issues
   - Performance optimization

### Phase 4: Testing & Deployment (Week 5)
1. **Day 1-2**: Comprehensive testing
   - Unit tests for backend
   - Integration tests
   - Frontend testing
   
2. **Day 3-4**: Deployment preparation
   - Set up production database
   - Configure production environment
   - Security hardening
   
3. **Day 5**: Go-live
   - Deploy to production
   - Monitor for issues
   - Performance verification

---

## 🧪 Testing Strategy

### 1. Backend Testing
```typescript
// Example test structure
describe('ProjectService', () => {
  beforeEach(() => {
    // Set up test database
  });
  
  it('should create a new project', async () => {
    const projectData = { name: 'Test Project', /* ... */ };
    const result = await ProjectService.createProject(projectData);
    expect(result.id).toBeDefined();
  });
});
```

### 2. Frontend Testing
- Update existing component tests
- Test new API integration
- Test authentication flows
- End-to-end testing with Cypress

### 3. Integration Testing
- API endpoint testing
- Database transaction testing
- Authentication flow testing
- Performance testing

---

## 🚀 Deployment Plan

### 1. Infrastructure Requirements
- **Database**: MySQL 8.0+ server
- **Backend**: Node.js 18+ server
- **Frontend**: Static file hosting (Nginx/Apache)
- **SSL**: HTTPS certificates for production

### 2. Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=workflow_lms
DB_USER=workflow_user
DB_PASS=secure_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Production Checklist
- [ ] Database server configured with proper users/permissions
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] Backup strategy implemented
- [ ] Monitoring and logging set up
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] API documentation updated

---

## 📊 Data Mapping Reference

### UUID to Integer Mapping
Since we're converting from UUID to auto-increment integers, here's how the relationships will be maintained:

```sql
-- Example mapping table for migration
CREATE TABLE id_mapping (
    old_uuid VARCHAR(36),
    new_id INT,
    table_name VARCHAR(50),
    INDEX idx_uuid (old_uuid),
    INDEX idx_new_id (new_id)
);
```

### Critical Relationships to Preserve
1. **Projects ↔ Team Members**: project_members table
2. **Tasks ↔ Assignees**: task_assignees table with type flag
3. **Educational Hierarchy**: grades → books → units → lessons
4. **Skills**: Separate tables for admin_user_skills and team_member_skills
5. **Performance Flags**: team member performance tracking

---

## ⚠️ Potential Challenges

### 1. Data Migration
- **Challenge**: UUID to INT conversion complexity
- **Solution**: Create comprehensive mapping script with validation

### 2. Authentication Transition
- **Challenge**: Users need to re-authenticate
- **Solution**: Implement smooth transition with clear communication

### 3. Real-time Features
- **Challenge**: Loss of Supabase real-time subscriptions
- **Solution**: Implement polling or WebSocket for critical updates

### 4. Type Safety
- **Challenge**: Frontend types need updating for new API responses
- **Solution**: Generate TypeScript types from backend models

---

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] All existing features work identically
- [ ] No data loss during migration
- [ ] Same user experience maintained
- [ ] Performance meets or exceeds current system

### Technical Requirements ✅
- [ ] Clean separation of frontend and backend
- [ ] Scalable database design
- [ ] Secure authentication system
- [ ] Comprehensive API documentation
- [ ] Proper error handling and logging

### Quality Requirements ✅
- [ ] 95%+ test coverage on backend
- [ ] API response times < 500ms
- [ ] Zero downtime deployment capability
- [ ] Comprehensive monitoring and alerting

---

This migration guide provides a complete roadmap for transitioning from Supabase to a traditional Node.js Express + MySQL architecture while maintaining all functionality and improving scalability.
