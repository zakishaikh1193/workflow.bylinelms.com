-- Sample stages and stage templates for category-based project management
-- This file modifies the database schema and creates sample data

-- First, we need to modify the existing stage_templates table to support linking to stages table
-- Remove the direct stage data columns and add stage_id foreign key

-- Step 1: Create a new stages table for category-based stages (if it doesn't exist)
-- Note: This creates a separate stages table for category templates, different from project-specific stages
CREATE TABLE IF NOT EXISTS `category_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_index`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Modify the existing stage_templates table to link to category_stages
-- First, backup existing data
CREATE TEMPORARY TABLE temp_stage_templates AS 
SELECT * FROM stage_templates;

-- Drop and recreate stage_templates table with new structure
DROP TABLE IF EXISTS `stage_templates`;

CREATE TABLE `stage_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `stage_id` int NOT NULL,
  `order_index` int DEFAULT '0',
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_stage` (`stage_id`),
  KEY `idx_order` (`order_index`),
  CONSTRAINT `stage_templates_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stage_templates_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `category_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Insert category stages
INSERT INTO category_stages (name, description, order_index, is_active) VALUES 
('Content Strategy', 'Define learning objectives and content outline', 1, 1),
('Instructional Design', 'Create detailed instructional design document', 2, 1),
('Storyboarding', 'Develop visual storyboards and content flow', 3, 1),
('Content Development', 'Create actual learning content and materials', 4, 1),
('Media Production', 'Produce multimedia elements and assets', 5, 1),
('Quality Assurance', 'Review and test content for accuracy and effectiveness', 6, 1),
('Final Review', 'Final approval and content validation', 7, 1),
('Deployment', 'Publish and deploy content to learning platform', 8, 1);

-- Create additional stages for different project types
INSERT INTO category_stages (name, description, order_index, is_active) VALUES 
('Requirements Analysis', 'Gather and analyze project requirements', 1, 1),
('System Design', 'Design system architecture and components', 2, 1),
('Implementation', 'Develop and implement system features', 3, 1),
('Testing', 'Comprehensive testing and bug fixes', 4, 1),
('Documentation', 'Create user and technical documentation', 5, 1),
('Deployment', 'Deploy system to production environment', 6, 1),
('Maintenance', 'Ongoing support and maintenance', 7, 1);

-- Step 4: Create stage templates linking stages to categories
-- For eLearning Design category (assuming category_id = 1)
INSERT INTO stage_templates (category_id, stage_id, order_index, is_default) VALUES 
(1, 1, 1, 1),  -- Content Strategy
(1, 2, 2, 0),  -- Instructional Design
(1, 3, 3, 0),  -- Storyboarding
(1, 4, 4, 0),  -- Content Development
(1, 5, 5, 0),  -- Media Production
(1, 6, 6, 0),  -- Quality Assurance
(1, 7, 7, 0),  -- Final Review
(1, 8, 8, 0);  -- Deployment

-- For Software Development category (assuming category_id = 2)
INSERT INTO stage_templates (category_id, stage_id, order_index, is_default) VALUES 
(2, 9, 1, 1),   -- Requirements Analysis
(2, 10, 2, 0),  -- System Design
(2, 11, 3, 0),  -- Implementation
(2, 12, 4, 0),  -- Testing
(2, 13, 5, 0),  -- Documentation
(2, 14, 6, 0),  -- Deployment
(2, 15, 7, 0);  -- Maintenance

-- For Content Creation category (assuming category_id = 3)
INSERT INTO stage_templates (category_id, stage_id, order_index, is_default) VALUES 
(3, 1, 1, 1),   -- Content Strategy
(3, 3, 2, 0),   -- Storyboarding
(3, 4, 3, 0),   -- Content Development
(3, 5, 4, 0),   -- Media Production
(3, 6, 5, 0),   -- Quality Assurance
(3, 7, 6, 0),   -- Final Review
(3, 8, 7, 0);   -- Deployment

-- Step 5: Clean up temporary table
DROP TEMPORARY TABLE IF EXISTS temp_stage_templates;

-- Note: Make sure to adjust category_id values based on your actual category IDs
-- You can check your categories table to get the correct IDs:
-- SELECT id, name FROM categories;
