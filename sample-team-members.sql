-- Sample team members data for testing
-- Note: All passcodes are 'DEMO123' (hashed)
INSERT INTO team_members (
  name, email, phone, passcode_hash, hourly_rate, 
  avatar_url, bio, status
) VALUES 
(
  'Sarah Johnson', 
  'sarah.johnson@example.com', 
  '+1-555-0101',
  '$2a$10$rOz1YGkTOLTfhN7j0CKv0eQKGzl3KdKGzl3KdKGzl3KdKGzl3KdKGe', 
  45.00,
  'https://images.unsplash.com/photo-1494790108755-2616b612b4c9?w=150&h=150&fit=crop&crop=face',
  'Senior Content Developer with 8+ years of experience in educational content creation and instructional design.',
  'active'
),
(
  'Mike Chen', 
  'mike.chen@example.com', 
  '+1-555-0102',
  '$2a$10$rOz1YGkTOLTfhN7j0CKv0eQKGzl3KdKGzl3KdKGzl3KdKGzl3KdKGe', 
  52.00,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'Technical Writer and Developer with expertise in React, Node.js, and educational technology platforms.',
  'active'
),
(
  'Emily Davis', 
  'emily.davis@example.com', 
  '+1-555-0103',
  '$2a$10$rOz1YGkTOLTfhN7j0CKv0eQKGzl3KdKGzl3KdKGzl3KdKGzl3KdKGe', 
  38.00,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'UX/UI Designer specializing in educational interfaces and user experience optimization.',
  'active'
),
(
  'David Wilson', 
  'david.wilson@example.com', 
  '+1-555-0104',
  '$2a$10$rOz1YGkTOLTfhN7j0CKv0eQKGzl3KdKGzl3KdKGzl3KdKGzl3KdKGe', 
  48.00,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'Project Manager with 10+ years experience leading educational content development teams.',
  'active'
),
(
  'Lisa Thompson', 
  'lisa.thompson@example.com', 
  '+1-555-0105',
  '$2a$10$rOz1YGkTOLTfhN7j0CKv0eQKGzl3KdKGzl3KdKGzl3KdKGzl3KdKGe', 
  42.00,
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'Quality Assurance Specialist ensuring high standards in educational content and platform functionality.',
  'active'
);

-- Sample team member skills (assuming some skills exist)
-- You can manually add these after the skills table is populated
-- INSERT INTO team_member_skills (team_member_id, skill_id) VALUES 
-- (1, 1), (1, 3), (1, 5),  -- Sarah: Content Writing, Instructional Design, Research
-- (2, 2), (2, 6), (2, 7),  -- Mike: Technical Writing, JavaScript, React
-- (3, 8), (3, 9), (3, 10), -- Emily: UI/UX Design, Figma, Adobe Creative
-- (4, 11), (4, 12), (4, 1), -- David: Project Management, Agile, Content Writing
-- (5, 13), (5, 14), (5, 15); -- Lisa: QA Testing, Documentation, Review
