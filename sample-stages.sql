-- Sample stages for projects
-- Add default stages to existing projects

-- Get project IDs and add stages for each
-- Stage 1: Planning
INSERT INTO stages (project_id, name, description, order_index, weight) VALUES 
(1, 'Planning', 'Project planning and requirement analysis', 1, 20.0),
(2, 'Planning', 'Project planning and requirement analysis', 1, 20.0),
(3, 'Planning', 'Project planning and requirement analysis', 1, 20.0),
(4, 'Planning', 'Project planning and requirement analysis', 1, 20.0),
(5, 'Planning', 'Project planning and requirement analysis', 1, 20.0);

-- Stage 2: Development
INSERT INTO stages (project_id, name, description, order_index, weight) VALUES 
(1, 'Development', 'Main development and implementation phase', 2, 50.0),
(2, 'Development', 'Main development and implementation phase', 2, 50.0),
(3, 'Development', 'Main development and implementation phase', 2, 50.0),
(4, 'Development', 'Main development and implementation phase', 2, 50.0),
(5, 'Development', 'Main development and implementation phase', 2, 50.0);

-- Stage 3: Review
INSERT INTO stages (project_id, name, description, order_index, weight) VALUES 
(1, 'Review', 'Quality assurance and review phase', 3, 20.0),
(2, 'Review', 'Quality assurance and review phase', 3, 20.0),
(3, 'Review', 'Quality assurance and review phase', 3, 20.0),
(4, 'Review', 'Quality assurance and review phase', 3, 20.0),
(5, 'Review', 'Quality assurance and review phase', 3, 20.0);

-- Stage 4: Completion
INSERT INTO stages (project_id, name, description, order_index, weight) VALUES 
(1, 'Completion', 'Final delivery and project closure', 4, 10.0),
(2, 'Completion', 'Final delivery and project closure', 4, 10.0),
(3, 'Completion', 'Final delivery and project closure', 4, 10.0),
(4, 'Completion', 'Final delivery and project closure', 4, 10.0),
(5, 'Completion', 'Final delivery and project closure', 4, 10.0);
