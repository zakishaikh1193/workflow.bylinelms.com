-- Sample Projects Data
-- Insert sample categories first (if not exists)
INSERT IGNORE INTO categories (name, description) VALUES 
('Web Development', 'Website and web application projects'),
('Mobile App', 'Mobile application development projects'),
('Data Analysis', 'Data science and analytics projects');

-- Insert sample projects
INSERT INTO projects (
  name, 
  description, 
  category_id, 
  status, 
  start_date, 
  end_date, 
  progress, 
  created_by
) VALUES 
(
  'E-commerce Website', 
  'Modern e-commerce platform with payment integration', 
  1, 
  'active', 
  '2024-01-15', 
  '2024-06-30', 
  45, 
  1
),
(
  'Mobile Fitness App', 
  'Cross-platform fitness tracking application', 
  2, 
  'planning', 
  '2024-02-01', 
  '2024-08-15', 
  15, 
  1
),
(
  'Sales Dashboard', 
  'Real-time sales analytics and reporting dashboard', 
  3, 
  'active', 
  '2024-01-01', 
  '2024-04-30', 
  75, 
  1
),
(
  'Company Website Redesign', 
  'Complete redesign of corporate website with modern UI/UX', 
  1, 
  'completed', 
  '2023-10-01', 
  '2024-01-15', 
  100, 
  1
),
(
  'Inventory Management System', 
  'Custom inventory tracking and management solution', 
  1, 
  'on-hold', 
  '2024-03-01', 
  '2024-09-30', 
  25, 
  1
);
