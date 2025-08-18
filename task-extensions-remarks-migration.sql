-- Task Extensions and Remarks Migration
-- This migration adds support for task extension requests and remarks/comments

-- =====================================================
-- TASK EXTENSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `task_extensions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `requested_by` int NOT NULL COMMENT 'ID of the user requesting extension (team_member_id or admin_user_id)',
  `requested_by_type` enum('admin','team') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of user requesting extension',
  `current_due_date` date NOT NULL COMMENT 'Original due date before extension',
  `requested_due_date` date NOT NULL COMMENT 'New requested due date',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reason for extension request',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Status of extension request',
  `reviewed_by` int DEFAULT NULL COMMENT 'ID of admin who reviewed the request',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT 'When the request was reviewed',
  `review_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes from admin review',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_requested_by` (`requested_by`,`requested_by_type`),
  KEY `idx_status` (`status`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  KEY `idx_dates` (`current_due_date`,`requested_due_date`),
  CONSTRAINT `fk_task_extensions_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_extensions_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track task extension requests from team members';

-- =====================================================
-- TASK REMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `task_remarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `added_by` int NOT NULL COMMENT 'ID of the user adding remark (team_member_id or admin_user_id)',
  `added_by_type` enum('admin','team') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of user adding remark',
  `remark_date` date NOT NULL COMMENT 'Date for the remark (can be current date or selected date)',
  `remark` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The remark/comment content',
  `remark_type` enum('general','progress','issue','update','other') COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT 'Type of remark for categorization',
  `is_private` tinyint(1) DEFAULT '0' COMMENT 'Whether remark is private (only visible to admins)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_added_by` (`added_by`,`added_by_type`),
  KEY `idx_remark_date` (`remark_date`),
  KEY `idx_remark_type` (`remark_type`),
  KEY `idx_private` (`is_private`),
  CONSTRAINT `fk_task_remarks_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track remarks/comments on tasks';

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Index for querying extensions by task and status
CREATE INDEX `idx_task_extensions_task_status` ON `task_extensions` (`task_id`, `status`);

-- Index for querying extensions by requester
CREATE INDEX `idx_task_extensions_requester` ON `task_extensions` (`requested_by`, `requested_by_type`, `status`);

-- Index for querying remarks by task and date
CREATE INDEX `idx_task_remarks_task_date` ON `task_remarks` (`task_id`, `remark_date`);

-- Index for querying remarks by user
CREATE INDEX `idx_task_remarks_user` ON `task_remarks` (`added_by`, `added_by_type`);

-- Index for querying remarks by type
CREATE INDEX `idx_task_remarks_type` ON `task_remarks` (`remark_type`, `is_private`);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample extension request
-- INSERT INTO `task_extensions` (`task_id`, `requested_by`, `requested_by_type`, `current_due_date`, `requested_due_date`, `reason`, `status`) VALUES
-- (13, 1, 'team', '2025-08-25', '2025-09-01', 'Need additional time to complete the educational hierarchy integration', 'pending');

-- Sample remark
-- INSERT INTO `task_remarks` (`task_id`, `added_by`, `added_by_type`, `remark_date`, `remark`, `remark_type`) VALUES
-- (13, 1, 'team', '2025-08-18', 'Started working on the task. Educational hierarchy components are complex but manageable.', 'progress');

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for active extension requests
CREATE OR REPLACE VIEW `active_extension_requests` AS
SELECT 
  te.id,
  te.task_id,
  t.name as task_name,
  te.requested_by,
  te.requested_by_type,
  CASE 
    WHEN te.requested_by_type = 'team' THEN tm.name
    WHEN te.requested_by_type = 'admin' THEN au.name
    ELSE 'Unknown'
  END as requester_name,
  te.current_due_date,
  te.requested_due_date,
  te.reason,
  te.status,
  te.created_at
FROM task_extensions te
JOIN tasks t ON te.task_id = t.id
LEFT JOIN team_members tm ON te.requested_by = tm.id AND te.requested_by_type = 'team'
LEFT JOIN admin_users au ON te.requested_by = au.id AND te.requested_by_type = 'admin'
WHERE te.status = 'pending'
ORDER BY te.created_at DESC;

-- View for task remarks with user names
CREATE OR REPLACE VIEW `task_remarks_with_users` AS
SELECT 
  tr.id,
  tr.task_id,
  t.name as task_name,
  tr.added_by,
  tr.added_by_type,
  CASE 
    WHEN tr.added_by_type = 'team' THEN tm.name
    WHEN tr.added_by_type = 'admin' THEN au.name
    ELSE 'Unknown'
  END as user_name,
  tr.remark_date,
  tr.remark,
  tr.remark_type,
  tr.is_private,
  tr.created_at
FROM task_remarks tr
JOIN tasks t ON tr.task_id = t.id
LEFT JOIN team_members tm ON tr.added_by = tm.id AND tr.added_by_type = 'team'
LEFT JOIN admin_users au ON tr.added_by = au.id AND tr.added_by_type = 'admin'
ORDER BY tr.remark_date DESC, tr.created_at DESC;

-- =====================================================
-- COMMENTS
-- =====================================================

-- Add comments to tables for documentation
ALTER TABLE `task_extensions` COMMENT = 'Track extension requests for tasks - allows team members to request deadline extensions';
ALTER TABLE `task_remarks` COMMENT = 'Track remarks/comments on tasks - allows users to add notes and updates';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Display summary
SELECT 'Task Extensions and Remarks Migration Completed Successfully' as status;
SELECT 'Created tables: task_extensions, task_remarks' as tables_created;
SELECT 'Created views: active_extension_requests, task_remarks_with_users' as views_created;
