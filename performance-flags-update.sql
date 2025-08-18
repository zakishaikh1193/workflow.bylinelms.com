-- Performance Flags Update Script
-- Update the performance_flags table to support the 4 flag types: Red, Orange, Yellow, Green

-- =====================================================
-- STEP 1: UPDATE THE ENUM VALUES
-- =====================================================

-- First, let's check the current structure
SELECT 'Current performance_flags structure:' as info;
DESCRIBE performance_flags;

-- Check current enum values
SELECT 'Current enum values:' as info;
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'performance_flags' 
AND COLUMN_NAME = 'type';

-- Update the enum to use the correct flag types
ALTER TABLE `performance_flags` 
MODIFY COLUMN `type` enum('red','orange','yellow','green') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- =====================================================
-- STEP 2: ADD TASK_ID COLUMN (OPTIONAL)
-- =====================================================

-- Add task_id column to link flags to specific tasks
ALTER TABLE `performance_flags` 
ADD COLUMN `task_id` int DEFAULT NULL AFTER `team_member_id`;

-- Add foreign key constraint for task_id
ALTER TABLE `performance_flags` 
ADD CONSTRAINT `fk_performance_flags_task` 
FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL;

-- Add index for task_id
ALTER TABLE `performance_flags` 
ADD INDEX `idx_task` (`task_id`);

-- =====================================================
-- STEP 3: UPDATE ADDED_BY COLUMN
-- =====================================================

-- Change added_by from varchar to int to store user ID
ALTER TABLE `performance_flags` 
ADD COLUMN `added_by_id` int DEFAULT NULL AFTER `added_by`;

-- Add foreign key constraint for added_by_id (admin_users)
ALTER TABLE `performance_flags` 
ADD CONSTRAINT `fk_performance_flags_added_by` 
FOREIGN KEY (`added_by_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

-- Add index for added_by_id
ALTER TABLE `performance_flags` 
ADD INDEX `idx_added_by` (`added_by_id`);

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

-- Check updated structure
SELECT 'Updated performance_flags structure:' as info;
DESCRIBE performance_flags;

-- Check updated enum values
SELECT 'Updated enum values:' as info;
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'performance_flags' 
AND COLUMN_NAME = 'type';

-- Check foreign key constraints
SELECT 'Foreign key constraints:' as info;
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'performance_flags'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- STEP 5: SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample performance flags (uncomment if needed)
-- INSERT INTO performance_flags (team_member_id, task_id, type, reason, added_by, added_by_id, created_at)
-- VALUES 
--   (8, 6, 'green', 'Excellent work on task completion', 'Demo Admin', 1, NOW()),
--   (16, 6, 'yellow', 'Good progress but needs improvement', 'Demo Admin', 1, NOW()),
--   (17, 6, 'orange', 'Some delays in delivery', 'Demo Admin', 1, NOW()),
--   (18, 6, 'red', 'Poor performance and missed deadlines', 'Demo Admin', 1, NOW());

SELECT 'Performance flags table updated successfully!' as status;
