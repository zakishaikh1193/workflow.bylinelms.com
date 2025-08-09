-- Create Demo Admin User
-- Password: demo123
INSERT INTO admin_users (email, password_hash, name, is_active, email_verified_at) VALUES 
('admin@demo.com', '$2b$12$LQv3c1yqBwEHXyx0fVu9DuSUG.t8tkUAw9LgKBOZKn9OgGrJRNu5u', 'Demo Admin', true, NOW());

-- To create additional admin users:
-- 1. Start your backend server
-- 2. Use the hash-password endpoint: POST http://localhost:3001/api/auth/hash-password
-- 3. Insert the generated hash into the database
