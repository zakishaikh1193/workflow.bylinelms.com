-- Migration to add current_stage_id to projects table
-- This allows projects to be in one stage at a time

-- Add current_stage_id column to projects table
ALTER TABLE `projects` 
ADD COLUMN `current_stage_id` int NULL AFTER `category_id`,
ADD CONSTRAINT `projects_current_stage_fk` 
FOREIGN KEY (`current_stage_id`) REFERENCES `category_stages` (`id`) ON DELETE SET NULL;

-- Add index for better performance
ALTER TABLE `projects` ADD INDEX `idx_current_stage` (`current_stage_id`);

-- Add comment explaining the column purpose
ALTER TABLE `projects` COMMENT = 'Projects table with current stage tracking - each project can be in one stage at a time';
