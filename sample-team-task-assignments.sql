-- Sample task assignments for team members
-- This will allow team members to see tasks in their portal

-- Assign some tasks to Zaki Shaikh (team member ID: 7)
INSERT INTO task_assignees (task_id, assignee_id, assignee_type, created_at) VALUES
(1, 7, 'team', NOW()),  -- Login Page task
(2, 7, 'team', NOW()),  -- Register Page task
(5, 7, 'team', NOW());  -- Task name task

-- Assign some tasks to Rahul Kirad (team member ID: 8)
INSERT INTO task_assignees (task_id, assignee_id, assignee_type, created_at) VALUES
(4, 8, 'team', NOW()),  -- sdffddsdsfg task
(6, 8, 'team', NOW());  -- bfdfbfdv task

-- Assign some tasks to other team members
INSERT INTO task_assignees (task_id, assignee_id, assignee_type, created_at) VALUES
(10, 1, 'team', NOW()), -- sdsdfds task to Sarah Johnson
(1, 2, 'team', NOW()),  -- Login Page task to Mike Chen
(2, 3, 'team', NOW());  -- Register Page task to Emily Rodriguez
