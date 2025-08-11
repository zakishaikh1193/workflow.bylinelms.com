-- =====================================================
-- Workflow LMS - MySQL Database Schema
-- Migration from Supabase PostgreSQL to MySQL
-- =====================================================

-- Set storage engine and character set
SET default_storage_engine = InnoDB;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. CORE REFERENCE TABLES
-- =====================================================

-- Categories for projects (eLearning Design, Curriculum Design, IT Applications)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills for team members and tasks
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USER MANAGEMENT TABLES
-- =====================================================

-- Admin users (replace Supabase auth)
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Team members (passcode-based authentication)
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    passcode VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_passcode (passcode),
    INDEX idx_active (is_active)
);

-- Admin user skills (many-to-many)
CREATE TABLE admin_user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Team member skills (many-to-many)
CREATE TABLE team_member_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_member_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_member_skill (team_member_id, skill_id),
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Performance flags for team members
CREATE TABLE performance_flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_member_id INT NOT NULL,
    type ENUM('gold', 'green', 'orange', 'red') NOT NULL,
    reason TEXT NOT NULL,
    added_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    INDEX idx_team_member (team_member_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 3. PROJECT MANAGEMENT TABLES
-- =====================================================

-- Main projects table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    status ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled') DEFAULT 'planning',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by INT,
    parent_id INT NULL, -- For sub-projects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_parent (parent_id)
);

-- Project team members (many-to-many with roles)
CREATE TABLE project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    user_type ENUM('admin', 'team') NOT NULL DEFAULT 'team',
    role ENUM('owner', 'manager', 'member') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_member (project_id, user_id, user_type),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_user (user_id, user_type)
);

-- Project stages (workflow stages)
CREATE TABLE stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0.00 CHECK (weight >= 0 AND weight <= 100), -- Percentage weight
    status ENUM('not-started', 'in-progress', 'under-review', 'completed') DEFAULT 'not-started',
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    parent_stage_id INT NULL, -- For sub-stages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_order (order_index),
    INDEX idx_parent_stage (parent_stage_id)
);

-- =====================================================
-- 4. EDUCATIONAL CONTENT HIERARCHY
-- =====================================================

-- Grades (KG-1, KG-2, Grade 1, etc.)
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_order (order_index)
);

-- Books (Student Book, Teacher Guide, Practice Book, Digital)
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('student', 'teacher', 'practice', 'digital') NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
    INDEX idx_grade (grade_id),
    INDEX idx_type (type),
    INDEX idx_order (order_index)
);

-- Units (themed learning modules within books)
CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book (book_id),
    INDEX idx_order (order_index)
);

-- Lessons (individual teaching units)
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    INDEX idx_unit (unit_id),
    INDEX idx_order (order_index)
);

-- =====================================================
-- 5. TASK MANAGEMENT
-- =====================================================

-- Tasks with complex relationships
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INT NOT NULL,
    stage_id INT NOT NULL,
    -- Educational component links (optional)
    grade_id INT NULL,
    book_id INT NULL,
    unit_id INT NULL,
    lesson_id INT NULL,
    component_path TEXT, -- Human-readable path like "KG-1 > Book 1 > Unit 1 > Lesson 1"
    status ENUM('not-started', 'in-progress', 'under-review', 'completed', 'blocked') DEFAULT 'not-started',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_hours DECIMAL(8,2) DEFAULT 0.00,
    actual_hours DECIMAL(8,2) DEFAULT 0.00,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_project (project_id),
    INDEX idx_stage (stage_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_components (grade_id, book_id, unit_id, lesson_id)
);

-- Task assignees (many-to-many for both admin users and team members)
CREATE TABLE task_assignees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    assignee_id INT NOT NULL,
    assignee_type ENUM('admin', 'team') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_task_assignee (task_id, assignee_id, assignee_type),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_assignee (assignee_id, assignee_type)
);

-- Task required skills (many-to-many)
CREATE TABLE task_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_task_skill (task_id, skill_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. REVIEW AND APPROVAL WORKFLOW
-- =====================================================

-- Review rounds for stages
CREATE TABLE review_rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'in-progress', 'approved', 'rejected') DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    INDEX idx_stage (stage_id),
    INDEX idx_status (status)
);

-- Review round reviewers (many-to-many)
CREATE TABLE review_round_reviewers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_round_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewer_type ENUM('admin', 'team') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review_reviewer (review_round_id, reviewer_id, reviewer_type),
    FOREIGN KEY (review_round_id) REFERENCES review_rounds(id) ON DELETE CASCADE,
    INDEX idx_review_round (review_round_id),
    INDEX idx_reviewer (reviewer_id, reviewer_type)
);

-- =====================================================
-- 7. TEAM ALLOCATION AND PLANNING
-- =====================================================

-- Team resource allocations
CREATE TABLE team_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('admin', 'team') NOT NULL,
    project_id INT NOT NULL,
    task_id INT,
    hours_per_day DECIMAL(4,2) DEFAULT 8.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_user (user_id, user_type),
    INDEX idx_project (project_id),
    INDEX idx_dates (start_date, end_date)
);

-- =====================================================
-- 8. AUTHENTICATION AND SESSIONS
-- =====================================================

-- Sessions for admin users (replace Supabase sessions)
CREATE TABLE admin_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    access_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_access_token (access_token(255))
);

-- Sessions for team members (simple session tracking)
CREATE TABLE team_member_sessions (
    id VARCHAR(255) PRIMARY KEY,
    team_member_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    INDEX idx_team_member (team_member_id),
    INDEX idx_expires (expires_at)
);

-- =====================================================
-- 9. SYSTEM SETTINGS AND CONFIGURATIONS
-- =====================================================

-- Functional units (organizational units)
CREATE TABLE functional_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_user_id INT,
    lead_user_type ENUM('admin', 'team'),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lead (lead_user_id, lead_user_type)
);

-- Functional unit skills
CREATE TABLE functional_unit_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    functional_unit_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_unit_skill (functional_unit_id, skill_id),
    FOREIGN KEY (functional_unit_id) REFERENCES functional_units(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- =====================================================
-- 10. TEAM MANAGEMENT SYSTEM
-- =====================================================

-- Teams (specific teams like "Developers", "Animators", "QA Team")
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    functional_unit_id INT,
    team_lead_id INT,
    team_lead_type ENUM('admin', 'team'),
    max_capacity INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (functional_unit_id) REFERENCES functional_units(id) ON DELETE SET NULL,
    INDEX idx_functional_unit (functional_unit_id),
    INDEX idx_team_lead (team_lead_id, team_lead_type),
    INDEX idx_active (is_active)
);

-- Team members (many-to-many relationship)
CREATE TABLE team_members_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    team_member_id INT NOT NULL,
    role ENUM('lead', 'senior', 'member', 'junior') DEFAULT 'member',
    joined_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_member (team_id, team_member_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    INDEX idx_team (team_id),
    INDEX idx_member (team_member_id),
    INDEX idx_active (is_active)
);

-- Team skills (skills that the team specializes in)
CREATE TABLE team_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_skill (team_id, skill_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_team (team_id),
    INDEX idx_skill (skill_id)
);

-- Project team assignments (assign teams to projects)
CREATE TABLE project_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    team_id INT NOT NULL,
    role ENUM('primary', 'secondary', 'support') DEFAULT 'primary',
    start_date DATE NOT NULL,
    end_date DATE,
    hours_per_day DECIMAL(4,2) DEFAULT 8.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_team (project_id, team_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_team (team_id),
    INDEX idx_dates (start_date, end_date)
);

-- Task team assignments (assign teams to tasks)
CREATE TABLE task_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    team_id INT NOT NULL,
    role ENUM('primary', 'secondary', 'support') DEFAULT 'primary',
    estimated_hours DECIMAL(8,2) DEFAULT 0.00,
    actual_hours DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_task_team (task_id, team_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_team (team_id)
);

-- Team performance metrics
CREATE TABLE team_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    project_id INT,
    metric_type ENUM('productivity', 'quality', 'timeliness', 'collaboration') NOT NULL,
    metric_value DECIMAL(5,2) NOT NULL,
    metric_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_team (team_id),
    INDEX idx_project (project_id),
    INDEX idx_metric_date (metric_date)
);

-- Stage templates for different project categories
CREATE TABLE stage_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_order (order_index)
);

-- =====================================================
-- 10. INSERT DEFAULT DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description, is_default) VALUES
('eLearning Design', 'Interactive online learning content and courses', TRUE),
('Curriculum Design', 'Educational curriculum and instructional materials', TRUE),
('IT Applications', 'Software development and technical solutions', TRUE);

-- Insert default skills
INSERT INTO skills (name, description, is_default) VALUES
('Content Writers', 'Creating written educational and marketing content', TRUE),
('Instructional Designers', 'Designing effective learning experiences', TRUE),
('Graphic Designers', 'Visual design and creative assets', TRUE),
('Developers', 'Software development and programming', TRUE),
('Animators', 'Animation and motion graphics', TRUE),
('Tech', 'Technical support and system administration', TRUE),
('Sales', 'Sales and business development', TRUE),
('Marketing', 'Marketing and promotional activities', TRUE),
('QA', 'Quality assurance and testing', TRUE);

-- Insert stage templates for eLearning Design
INSERT INTO stage_templates (category_id, name, description, order_index, is_default) VALUES
(1, 'Content Strategy', 'Define learning objectives and content outline', 1, TRUE),
(1, 'Instructional Design', 'Create detailed instructional design document', 2, TRUE),
(1, 'Storyboarding', 'Visual planning and storyboard creation', 3, TRUE),
(1, 'Content Development', 'Content creation and writing phase', 4, TRUE),
(1, 'Media Production', 'Graphics, animations, and multimedia creation', 5, TRUE),
(1, 'Development & Integration', 'Technical development and LMS integration', 6, TRUE),
(1, 'Review & QA', 'Quality assurance and review process', 7, TRUE),
(1, 'Deployment', 'Final deployment and launch', 8, TRUE);

-- Insert stage templates for Curriculum Design
INSERT INTO stage_templates (category_id, name, description, order_index, is_default) VALUES
(2, 'Curriculum Analysis', 'Analyze curriculum requirements and standards', 1, TRUE),
(2, 'Scope & Sequence', 'Define scope and sequence of curriculum', 2, TRUE),
(2, 'Learning Objectives', 'Define detailed learning objectives', 3, TRUE),
(2, 'Content Creation', 'Develop curriculum content and materials', 4, TRUE),
(2, 'Assessment Design', 'Create assessments and evaluation tools', 5, TRUE),
(2, 'Teacher Resources', 'Develop teacher guides and resources', 6, TRUE),
(2, 'Pilot Testing', 'Pilot test with target audience', 7, TRUE),
(2, 'Revision & Finalization', 'Revise based on feedback and finalize', 8, TRUE);

-- Insert stage templates for IT Applications
INSERT INTO stage_templates (category_id, name, description, order_index, is_default) VALUES
(3, 'Requirements Analysis', 'Gather and analyze system requirements', 1, TRUE),
(3, 'System Design', 'Design system architecture and database', 2, TRUE),
(3, 'UI/UX Design', 'Design user interface and user experience', 3, TRUE),
(3, 'Frontend Development', 'Develop user interface and client-side logic', 4, TRUE),
(3, 'Backend Development', 'Develop server-side logic and APIs', 5, TRUE),
(3, 'Database Implementation', 'Implement database and data models', 6, TRUE),
(3, 'Integration Testing', 'Test system integration and APIs', 7, TRUE),
(3, 'User Acceptance Testing', 'Conduct user acceptance testing', 8, TRUE),
(3, 'Deployment & Launch', 'Deploy to production and launch', 9, TRUE);

-- Insert default admin user (password: demo123 - hash this in production!)
INSERT INTO admin_users (email, password_hash, name, is_active, email_verified_at) VALUES
('admin@demo.com', '$2b$10$rKvK0Y.0ot0YxOQHQQb2lOgKj8Y8qY8qY8qY8qY8qY8qY8qY8qY8q', 'Demo Admin', TRUE, NOW());

-- Insert sample team members
INSERT INTO team_members (name, email, passcode, is_active) VALUES
('Sarah Johnson', 'sarah.johnson@company.com', 'DEMO123', TRUE),
('Mike Chen', 'mike.chen@company.com', 'TECH456', TRUE),
('Emily Rodriguez', 'emily.rodriguez@company.com', 'DESIGN789', TRUE),
('David Kim', 'david.kim@company.com', 'QA2024', TRUE),
('Lisa Thompson', 'lisa.thompson@company.com', 'MARKET99', TRUE),
('John Smith', 'john.smith@company.com', 'WRITE42', TRUE);

-- Insert sample functional unit
INSERT INTO functional_units (name, description, is_default) VALUES
('Content Development Unit', 'Responsible for creating and developing educational content', TRUE);

-- =====================================================
-- 11. INSERT SAMPLE TEAM DATA
-- =====================================================

-- Insert sample teams
INSERT INTO teams (name, description, functional_unit_id, team_lead_id, team_lead_type, max_capacity) VALUES
('Content Writers Team', 'Specialized team for creating educational content and copywriting', 1, 1, 'team', 8),
('Instructional Design Team', 'Team focused on instructional design and learning experience creation', 1, 2, 'team', 6),
('Graphic Design Team', 'Visual design and creative assets team', 1, 3, 'team', 5),
('Development Team', 'Software development and programming team', 1, 4, 'team', 10),
('Animation Team', 'Animation and motion graphics team', 1, 5, 'team', 4),
('QA Team', 'Quality assurance and testing team', 1, 6, 'team', 6);

-- Insert team members into teams
INSERT INTO team_members_teams (team_id, team_member_id, role, joined_date) VALUES
-- Content Writers Team
(1, 1, 'lead', '2024-01-01'),
(1, 2, 'senior', '2024-01-15'),

-- Instructional Design Team  
(2, 2, 'lead', '2024-01-01'),
(2, 1, 'senior', '2024-01-10'),

-- Graphic Design Team
(3, 3, 'lead', '2024-01-01'),
(3, 4, 'member', '2024-02-01'),

-- Development Team
(4, 4, 'lead', '2024-01-01'),
(4, 5, 'senior', '2024-01-20'),

-- Animation Team
(5, 5, 'lead', '2024-01-01'),
(5, 3, 'member', '2024-01-15'),

-- QA Team
(6, 6, 'lead', '2024-01-01'),
(6, 4, 'member', '2024-02-15');

-- Insert team skills
INSERT INTO team_skills (team_id, skill_id, proficiency_level) VALUES
-- Content Writers Team skills
(1, 1, 'expert'), -- Content Writers
(1, 2, 'advanced'), -- Instructional Designers

-- Instructional Design Team skills
(2, 2, 'expert'), -- Instructional Designers
(2, 1, 'advanced'), -- Content Writers

-- Graphic Design Team skills
(3, 3, 'expert'), -- Graphic Designers
(3, 5, 'advanced'), -- Animators

-- Development Team skills
(4, 4, 'expert'), -- Developers
(4, 6, 'advanced'), -- Tech

-- Animation Team skills
(5, 5, 'expert'), -- Animators
(5, 3, 'advanced'), -- Graphic Designers

-- QA Team skills
(6, 9, 'expert'), -- QA
(6, 4, 'intermediate'); -- Developers

-- =====================================================
-- 12. INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for complex queries
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee_status ON task_assignees(assignee_id, assignee_type);
CREATE INDEX idx_projects_category_status ON projects(category_id, status);
CREATE INDEX idx_performance_flags_member_type ON performance_flags(team_member_id, type);
CREATE INDEX idx_stages_project_status ON stages(project_id, status);
CREATE INDEX idx_allocations_user_dates ON team_allocations(user_id, user_type, start_date, end_date);

-- Team management indexes
CREATE INDEX idx_teams_functional_unit_active ON teams(functional_unit_id, is_active);
CREATE INDEX idx_team_members_teams_active ON team_members_teams(team_id, is_active);
CREATE INDEX idx_team_members_teams_member_active ON team_members_teams(team_member_id, is_active);
CREATE INDEX idx_project_teams_dates ON project_teams(project_id, start_date, end_date);
CREATE INDEX idx_task_teams_role ON task_teams(task_id, role);
CREATE INDEX idx_team_performance_team_date ON team_performance(team_id, metric_date);

-- Full-text search indexes
ALTER TABLE projects ADD FULLTEXT(name, description);
ALTER TABLE tasks ADD FULLTEXT(name, description);
ALTER TABLE team_members ADD FULLTEXT(name, email);
ALTER TABLE admin_users ADD FULLTEXT(name, email);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
