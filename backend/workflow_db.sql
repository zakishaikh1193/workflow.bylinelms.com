-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 18, 2025 at 10:24 AM
-- Server version: 9.1.0
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `workflow_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `access_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_access_token` (`access_token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_sessions`
--

INSERT INTO `admin_sessions` (`id`, `user_id`, `access_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`) VALUES
('admin_1_1755504653215', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA0NjUzLCJleHAiOjE3NTU1OTEwNTN9.u_0LoYrNcN0VwDUchL9A6yoSPxnIeKuJU3pOSom0YBw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA0NjUzLCJleHAiOjE3NTYxMDk0NTN9.Djxis-53fHmLoO1PJvFkbOCNHV61Nv-0T07LPZMoe6A', '2025-08-19 08:10:53', '2025-08-18 08:10:53', '2025-08-18 08:10:53'),
('admin_1_1755504766556', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA0NzY2LCJleHAiOjE3NTU1OTExNjZ9.In54cp88yN9xZWBGsAcOPjwWcmNBx9ExF9HlZIbmzTE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA0NzY2LCJleHAiOjE3NTYxMDk1NjZ9.8nowsFT-Ih9rtddkeeHnssaP_WcBDpenoARyQfyUr70', '2025-08-19 08:12:46', '2025-08-18 08:12:46', '2025-08-18 08:12:46'),
('admin_1_1755506181423', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA2MTgxLCJleHAiOjE3NTU1OTI1ODF9.PT1B7rCPbLjX5oMPuLzIu7yzpUUXNUVRCoGv4Vdfsi4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTA2MTgxLCJleHAiOjE3NTYxMTA5ODF9.SIS935qUq7UBnrN2AzSLT9y8yXEG0DbF9EXvmDQnCGQ', '2025-08-19 08:36:21', '2025-08-18 08:36:21', '2025-08-18 08:36:21'),
('admin_1_1755510879631', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEwODc5LCJleHAiOjE3NTU1OTcyNzl9.ezBKo19MBM0iU0FLl3S9lIDFwU7ERRFCZXfOTtITlmo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEwODc5LCJleHAiOjE3NTYxMTU2Nzl9.zL60hgNqOYAiKQ_17ZesXEwpIdnYR1gM4DPc-jJBspg', '2025-08-19 09:54:39', '2025-08-18 09:54:39', '2025-08-18 09:54:39'),
('admin_1_1755512430157', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEyNDMwLCJleHAiOjE3NTU1OTg4MzB9.MnXwI2BqOor5lMkJse_6XzEh23xeWf7XAkJIusGZ7vw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEyNDMwLCJleHAiOjE3NTYxMTcyMzB9.mhK1xiDUrhR2Xodhnjk0AI4G5bTTsgQb_XXl-CInneQ', '2025-08-19 10:20:30', '2025-08-18 10:20:30', '2025-08-18 10:20:30');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `name`, `avatar_url`, `is_active`, `last_login_at`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'info@bylinelearning.com', '$2b$10$U0wXs2mwUNm3OTBCAEFeNOhvYEUjJcWag7YIwxUgaz9F9CFqx7j1m', 'Demo Admin', NULL, 1, '2025-08-18 10:20:30', '2025-08-09 13:56:11', '2025-08-09 13:56:11', '2025-08-18 10:20:30');

-- --------------------------------------------------------

--
-- Table structure for table `admin_user_skills`
--

DROP TABLE IF EXISTS `admin_user_skills`;
CREATE TABLE IF NOT EXISTS `admin_user_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_skill` (`user_id`,`skill_id`),
  KEY `skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
CREATE TABLE IF NOT EXISTS `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grade_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('student','teacher','practice','digital') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `weight` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_grade` (`grade_id`),
  KEY `idx_type` (`type`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `grade_id`, `name`, `type`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(2, 4, 'L1', 'student', NULL, 1, 0.00, '2025-08-14 22:03:39', '2025-08-14 22:03:39'),
(3, 4, 'L2', 'student', NULL, 2, 0.00, '2025-08-14 22:03:46', '2025-08-14 22:03:46'),
(4, 4, 'L3', 'student', NULL, 3, 0.00, '2025-08-14 22:03:50', '2025-08-14 22:03:50'),
(5, 4, 'L4', 'student', NULL, 4, 0.00, '2025-08-14 22:03:53', '2025-08-14 22:03:53'),
(6, 4, 'L5', 'student', NULL, 5, 0.00, '2025-08-14 22:03:57', '2025-08-14 22:03:57'),
(7, 4, 'L6', 'student', NULL, 6, 0.00, '2025-08-14 22:04:04', '2025-08-14 22:04:04'),
(8, 4, 'L7', 'student', NULL, 7, 0.00, '2025-08-14 22:04:09', '2025-08-14 22:04:09'),
(9, 5, 'L1', 'student', NULL, 1, 0.00, '2025-08-14 22:04:21', '2025-08-14 22:04:21'),
(10, 5, 'L2', 'student', NULL, 2, 0.00, '2025-08-14 22:04:26', '2025-08-14 22:04:26'),
(11, 5, 'L3', 'student', NULL, 3, 0.00, '2025-08-14 22:04:30', '2025-08-14 22:04:30'),
(12, 5, 'L4', 'student', NULL, 4, 0.00, '2025-08-14 22:04:34', '2025-08-14 22:04:34'),
(13, 5, 'L5', 'student', NULL, 5, 0.00, '2025-08-14 22:04:37', '2025-08-14 22:04:37'),
(14, 5, 'L6', 'student', NULL, 6, 0.00, '2025-08-14 22:04:42', '2025-08-14 22:04:42'),
(15, 5, 'L7', 'student', '', 7, 0.00, '2025-08-14 22:04:46', '2025-08-14 22:04:54'),
(16, 6, 'L1', 'student', NULL, 1, 0.00, '2025-08-14 22:05:16', '2025-08-14 22:05:16'),
(17, 6, 'L2', 'student', NULL, 2, 0.00, '2025-08-14 22:05:22', '2025-08-14 22:05:22'),
(18, 6, 'L3', 'student', NULL, 3, 0.00, '2025-08-14 22:05:28', '2025-08-14 22:05:28'),
(19, 6, 'L4', 'student', NULL, 4, 0.00, '2025-08-14 22:05:33', '2025-08-14 22:05:33'),
(20, 6, 'L5', 'student', NULL, 5, 0.00, '2025-08-14 22:05:35', '2025-08-14 22:05:35'),
(21, 6, 'L6', 'student', NULL, 6, 0.00, '2025-08-14 22:05:40', '2025-08-14 22:05:40'),
(22, 6, 'L7', 'student', NULL, 7, 0.00, '2025-08-14 22:05:45', '2025-08-14 22:05:45'),
(23, 7, 'L1', 'student', NULL, 1, 0.00, '2025-08-14 22:05:53', '2025-08-14 22:05:53'),
(24, 7, 'L2', 'student', NULL, 2, 0.00, '2025-08-14 22:06:03', '2025-08-14 22:06:03'),
(25, 7, 'L2', 'student', NULL, 3, 0.00, '2025-08-14 22:06:03', '2025-08-14 22:06:03'),
(26, 7, 'L3', 'student', NULL, 4, 0.00, '2025-08-14 22:06:10', '2025-08-14 22:06:10'),
(27, 7, 'L4', 'student', NULL, 5, 0.00, '2025-08-14 22:06:14', '2025-08-14 22:06:14'),
(28, 7, 'L5', 'student', NULL, 6, 0.00, '2025-08-14 22:06:18', '2025-08-14 22:06:18'),
(29, 7, 'L6', 'student', NULL, 7, 0.00, '2025-08-14 22:06:20', '2025-08-14 22:06:20'),
(30, 7, 'L7', 'student', NULL, 8, 0.00, '2025-08-14 22:06:24', '2025-08-14 22:06:24'),
(31, 8, 'L1', 'student', NULL, 1, 0.00, '2025-08-14 22:06:33', '2025-08-14 22:06:33'),
(32, 8, 'L2', 'student', NULL, 2, 0.00, '2025-08-14 22:06:36', '2025-08-14 22:06:36'),
(33, 8, 'L3', 'student', NULL, 3, 0.00, '2025-08-14 22:06:40', '2025-08-14 22:06:40'),
(34, 8, 'L4', 'student', NULL, 4, 0.00, '2025-08-14 22:06:43', '2025-08-14 22:06:43'),
(35, 8, 'L5', 'student', NULL, 5, 0.00, '2025-08-14 22:06:47', '2025-08-14 22:06:47'),
(36, 8, 'L6', 'student', NULL, 6, 0.00, '2025-08-14 22:06:51', '2025-08-14 22:06:51'),
(37, 8, 'L7', 'student', NULL, 7, 0.00, '2025-08-14 22:06:54', '2025-08-14 22:06:54'),
(38, 9, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:31:43', '2025-08-14 22:31:43'),
(39, 9, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:31:47', '2025-08-14 22:31:47'),
(40, 9, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:31:50', '2025-08-14 22:31:50'),
(41, 9, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:31:53', '2025-08-14 22:31:53'),
(42, 9, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:31:57', '2025-08-14 22:31:57'),
(43, 9, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:31:59', '2025-08-14 22:31:59'),
(44, 10, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:32:04', '2025-08-14 22:32:04'),
(45, 10, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:32:08', '2025-08-14 22:32:08'),
(46, 10, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:32:14', '2025-08-14 22:32:14'),
(47, 10, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:32:18', '2025-08-14 22:32:18'),
(48, 10, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:32:21', '2025-08-14 22:32:21'),
(49, 10, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:32:24', '2025-08-14 22:32:24'),
(50, 11, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:32:29', '2025-08-14 22:32:29'),
(51, 11, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:32:34', '2025-08-14 22:32:34'),
(52, 11, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:32:38', '2025-08-14 22:32:38'),
(53, 11, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:32:41', '2025-08-14 22:32:41'),
(54, 11, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:32:46', '2025-08-14 22:32:46'),
(55, 11, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:32:51', '2025-08-14 22:32:51'),
(56, 12, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:34:14', '2025-08-14 22:34:14'),
(57, 12, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:34:18', '2025-08-14 22:34:18'),
(58, 12, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:34:21', '2025-08-14 22:34:21'),
(59, 12, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:34:24', '2025-08-14 22:34:24'),
(60, 12, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:34:28', '2025-08-14 22:34:28'),
(61, 12, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:34:33', '2025-08-14 22:34:33'),
(62, 13, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:34:49', '2025-08-14 22:34:49'),
(63, 13, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:34:53', '2025-08-14 22:34:53'),
(64, 13, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:34:57', '2025-08-14 22:34:57'),
(65, 13, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:35:01', '2025-08-14 22:35:01'),
(66, 13, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:35:04', '2025-08-14 22:35:04'),
(67, 13, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:35:08', '2025-08-14 22:35:08'),
(68, 14, 'Book 1', 'student', NULL, 1, 0.00, '2025-08-14 22:35:12', '2025-08-14 22:35:12'),
(69, 14, 'Book 2', 'student', NULL, 2, 0.00, '2025-08-14 22:35:16', '2025-08-14 22:35:16'),
(70, 14, 'Book 3', 'student', NULL, 3, 0.00, '2025-08-14 22:35:19', '2025-08-14 22:35:19'),
(71, 14, 'Book 4', 'student', NULL, 4, 0.00, '2025-08-14 22:35:22', '2025-08-14 22:35:22'),
(72, 14, 'Book 5', 'student', NULL, 5, 0.00, '2025-08-14 22:35:25', '2025-08-14 22:35:25'),
(73, 14, 'Book 6', 'student', NULL, 6, 0.00, '2025-08-14 22:35:29', '2025-08-14 22:35:29'),
(74, 15, 'English', 'student', NULL, 1, 0.00, '2025-08-14 22:35:57', '2025-08-14 22:35:57'),
(75, 15, 'Math', 'student', NULL, 2, 0.00, '2025-08-14 22:36:04', '2025-08-14 22:36:04'),
(76, 15, 'Science', 'student', NULL, 3, 0.00, '2025-08-14 22:36:10', '2025-08-14 22:36:10'),
(77, 16, 'English', 'student', NULL, 1, 0.00, '2025-08-14 22:36:17', '2025-08-14 22:36:17'),
(78, 16, 'Math', 'student', NULL, 2, 0.00, '2025-08-14 22:36:23', '2025-08-14 22:36:23'),
(79, 16, 'Science', 'student', NULL, 3, 0.00, '2025-08-14 22:36:28', '2025-08-14 22:36:28'),
(80, 17, 'English', 'student', NULL, 1, 0.00, '2025-08-14 22:36:33', '2025-08-14 22:36:33'),
(81, 17, 'Math', 'student', NULL, 2, 0.00, '2025-08-14 22:36:38', '2025-08-14 22:36:38'),
(82, 17, 'Science', 'student', NULL, 3, 0.00, '2025-08-14 22:36:43', '2025-08-14 22:36:43');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'eLearning Design', 'Interactive online learning content and courses', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(2, 'Curriculum Design', 'Educational curriculum and instructional materials', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(3, 'IT Applications', 'Software development and technical solutions', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(4, 'Web Development', 'Website and web application projects', 0, '2025-08-09 16:45:32', '2025-08-09 16:45:32'),
(6, 'Data Analysis', 'Data science and analytics projects', 0, '2025-08-09 16:45:32', '2025-08-09 16:45:32');

-- --------------------------------------------------------

--
-- Table structure for table `category_stages`
--

DROP TABLE IF EXISTS `category_stages`;
CREATE TABLE IF NOT EXISTS `category_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_index`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category_stages`
--

INSERT INTO `category_stages` (`id`, `name`, `description`, `order_index`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Content Strategy', 'Define learning objectives and content outline', 1, 1, '2025-08-14 13:23:11', '2025-08-14 14:00:10'),
(2, 'Instructional Design', 'Create detailed instructional design document', 2, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(3, 'Storyboarding', 'Develop visual storyboards and content flow', 3, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(4, 'Content Development', 'Create actual learning content and materials', 4, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(5, 'Media Production', 'Produce multimedia elements and assets', 5, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(6, 'Quality Assurance', 'Review and test content for accuracy and effectiveness', 6, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(7, 'Final Review', 'Final approval and content validation', 7, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(8, 'Deployment', 'Publish and deploy content to learning platform', 8, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(9, 'Requirements Analysis', 'Gather and analyze project requirements', 1, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(10, 'System Design', 'Design system architecture and components', 2, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(11, 'Implementation', 'Develop and implement system features', 3, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(12, 'Testing', 'Comprehensive testing and bug fixes', 4, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(13, 'Documentation', 'Create user and technical documentation', 5, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(14, 'Deployment', 'Deploy system to production environment', 6, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(15, 'Maintenance', 'Ongoing support and maintenance', 7, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(16, 'System Design', 'System Design', 8, 1, '2025-08-14 13:41:53', '2025-08-14 13:41:53'),
(17, 'dfsdsfsdf', 'fdssdf', 9, 1, '2025-08-14 13:42:06', '2025-08-14 13:42:06'),
(19, 'QA', 'The Quality Assurance stage is the final review process, ensuring a book’s design, content, and technical specifications meet all editorial, brand, and production standards before release.', 8, 1, '2025-08-14 22:30:18', '2025-08-14 22:30:18'),
(20, 'Test Stage', 'Test Stage', 9, 1, '2025-08-18 09:01:51', '2025-08-18 09:01:51');

-- --------------------------------------------------------

--
-- Table structure for table `functional_units`
--

DROP TABLE IF EXISTS `functional_units`;
CREATE TABLE IF NOT EXISTS `functional_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `lead_user_id` int DEFAULT NULL,
  `lead_user_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lead` (`lead_user_id`,`lead_user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `functional_units`
--

INSERT INTO `functional_units` (`id`, `name`, `description`, `lead_user_id`, `lead_user_type`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Content Development Unit', 'Responsible for creating and developing educational content', NULL, NULL, 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11');

-- --------------------------------------------------------

--
-- Table structure for table `functional_unit_skills`
--

DROP TABLE IF EXISTS `functional_unit_skills`;
CREATE TABLE IF NOT EXISTS `functional_unit_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `functional_unit_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_unit_skill` (`functional_unit_id`,`skill_id`),
  KEY `skill_id` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `weight` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `project_id`, `name`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(4, 12, 'G1', NULL, 1, 0.00, '2025-08-14 22:03:23', '2025-08-14 22:03:23'),
(5, 12, 'G2', NULL, 2, 0.00, '2025-08-14 22:04:16', '2025-08-14 22:04:16'),
(6, 12, 'G3', NULL, 3, 0.00, '2025-08-14 22:05:01', '2025-08-14 22:05:01'),
(7, 12, 'G4', NULL, 4, 0.00, '2025-08-14 22:05:04', '2025-08-14 22:05:04'),
(8, 12, 'G5', NULL, 5, 0.00, '2025-08-14 22:05:08', '2025-08-14 22:05:08'),
(9, 13, 'SB Level 1', '', 1, 0.00, '2025-08-14 22:31:26', '2025-08-14 22:33:29'),
(10, 13, 'SB Level 2', '', 2, 0.00, '2025-08-14 22:31:30', '2025-08-14 22:33:36'),
(11, 13, 'SB Level 3', '', 3, 0.00, '2025-08-14 22:31:35', '2025-08-14 22:33:44'),
(12, 13, 'TB Level 1', NULL, 4, 0.00, '2025-08-14 22:34:06', '2025-08-14 22:34:06'),
(13, 13, 'TB Level 2', NULL, 5, 0.00, '2025-08-14 22:34:40', '2025-08-14 22:34:40'),
(14, 13, 'TB Level 3', NULL, 6, 0.00, '2025-08-14 22:34:43', '2025-08-14 22:34:43'),
(15, 13, 'PB Level 1', NULL, 7, 0.00, '2025-08-14 22:35:38', '2025-08-14 22:35:38'),
(16, 13, 'PB Level 2', NULL, 8, 0.00, '2025-08-14 22:35:43', '2025-08-14 22:35:43'),
(17, 13, 'PB Level 3', NULL, 9, 0.00, '2025-08-14 22:35:45', '2025-08-14 22:35:45');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `weight` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_unit` (`unit_id`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_flags`
--

DROP TABLE IF EXISTS `performance_flags`;
CREATE TABLE IF NOT EXISTS `performance_flags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_member_id` int NOT NULL,
  `type` enum('gold','green','orange','red') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_team_member` (`team_member_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_performance_flags_member_type` (`team_member_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category_id` int DEFAULT NULL,
  `current_stage_id` int DEFAULT NULL,
  `status` enum('planning','active','on-hold','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'planning',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_projects_category_status` (`category_id`,`status`),
  KEY `idx_current_stage` (`current_stage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `category_id`, `current_stage_id`, `status`, `start_date`, `end_date`, `progress`, `created_by`, `parent_id`, `created_at`, `updated_at`) VALUES
(12, 'ICT Digital', '', 1, 3, 'planning', '2025-08-14', '2025-09-30', 0, 1, NULL, '2025-08-14 21:46:44', '2025-08-18 08:59:08'),
(13, 'Pre-KG', '', 2, 9, 'planning', '2025-08-14', '2025-09-25', 45, 1, NULL, '2025-08-14 22:31:07', '2025-08-18 09:24:04');

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
CREATE TABLE IF NOT EXISTS `project_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'team',
  `role` enum('owner','manager','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_member` (`project_id`,`user_id`,`user_type`),
  KEY `idx_project` (`project_id`),
  KEY `idx_user` (`user_id`,`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_members`
--

INSERT INTO `project_members` (`id`, `project_id`, `user_id`, `user_type`, `role`, `created_at`) VALUES
(9, 12, 9, 'team', 'member', '2025-08-14 22:07:28'),
(10, 12, 13, 'team', 'member', '2025-08-14 22:07:28'),
(11, 12, 15, 'team', 'member', '2025-08-14 22:07:28'),
(12, 12, 10, 'team', 'member', '2025-08-14 22:07:43'),
(13, 12, 11, 'team', 'member', '2025-08-14 22:07:43'),
(14, 12, 12, 'team', 'member', '2025-08-14 22:07:43'),
(15, 12, 14, 'team', 'member', '2025-08-14 22:07:43');

-- --------------------------------------------------------

--
-- Table structure for table `project_teams`
--

DROP TABLE IF EXISTS `project_teams`;
CREATE TABLE IF NOT EXISTS `project_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `team_id` int NOT NULL,
  `role` enum('primary','secondary','support') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'primary',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `hours_per_day` decimal(4,2) DEFAULT '8.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_team` (`project_id`,`team_id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_team` (`team_id`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_teams`
--

INSERT INTO `project_teams` (`id`, `project_id`, `team_id`, `role`, `start_date`, `end_date`, `hours_per_day`, `created_at`, `updated_at`) VALUES
(2, 8, 2, '', '2025-08-11', NULL, 8.00, '2025-08-11 19:24:08', '2025-08-11 19:24:08'),
(3, 12, 4, '', '2025-08-14', NULL, 8.00, '2025-08-14 22:07:28', '2025-08-14 22:07:28'),
(4, 12, 5, '', '2025-08-14', NULL, 8.00, '2025-08-14 22:07:43', '2025-08-14 22:07:43');

-- --------------------------------------------------------

--
-- Table structure for table `review_rounds`
--

DROP TABLE IF EXISTS `review_rounds`;
CREATE TABLE IF NOT EXISTS `review_rounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stage_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','in-progress','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stage` (`stage_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_round_reviewers`
--

DROP TABLE IF EXISTS `review_round_reviewers`;
CREATE TABLE IF NOT EXISTS `review_round_reviewers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_round_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `reviewer_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review_reviewer` (`review_round_id`,`reviewer_id`,`reviewer_type`),
  KEY `idx_review_round` (`review_round_id`),
  KEY `idx_reviewer` (`reviewer_id`,`reviewer_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
CREATE TABLE IF NOT EXISTS `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`, `description`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Content Writers', 'Creating written educational and marketing content', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(2, 'Instructional Designers', 'Designing effective learning experiences', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(3, 'Graphic Designers', 'Visual design and creative assets', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(4, 'Developers', 'Software development and programming', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(5, 'Animators', 'Animation and motion graphics', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(6, 'Tech', 'Technical support and system administration', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(7, 'Sales', 'Sales and business development', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(8, 'Marketing', 'Marketing and promotional activities', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(9, 'QA', 'Quality assurance and testing', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(10, 'Instructional Design', 'Skill for Instructional Design', 0, '2025-08-11 16:00:01', '2025-08-11 16:00:01');

-- --------------------------------------------------------

--
-- Table structure for table `stages`
--

DROP TABLE IF EXISTS `stages`;
CREATE TABLE IF NOT EXISTS `stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `weight` decimal(5,2) DEFAULT '0.00',
  `status` enum('not-started','in-progress','under-review','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'not-started',
  `progress` int DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `parent_stage_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_order` (`order_index`),
  KEY `idx_parent_stage` (`parent_stage_id`),
  KEY `idx_stages_project_status` (`project_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stage_templates`
--

DROP TABLE IF EXISTS `stage_templates`;
CREATE TABLE IF NOT EXISTS `stage_templates` (
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
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stage_templates`
--

INSERT INTO `stage_templates` (`id`, `category_id`, `stage_id`, `order_index`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 1, '2025-08-14 13:23:11', '2025-08-18 09:02:09'),
(2, 1, 2, 4, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:05'),
(3, 1, 3, 3, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:07'),
(4, 1, 4, 5, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:05'),
(5, 1, 5, 6, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:04'),
(6, 1, 6, 7, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:03'),
(7, 1, 7, 8, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:01'),
(8, 1, 8, 9, 0, '2025-08-14 13:23:11', '2025-08-18 09:02:00'),
(9, 2, 9, 1, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(10, 2, 10, 2, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(11, 2, 11, 3, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(12, 2, 12, 4, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(13, 2, 13, 5, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(14, 2, 14, 6, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(15, 2, 15, 7, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(16, 3, 1, 1, 1, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(17, 3, 3, 2, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(18, 3, 4, 3, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(19, 3, 5, 4, 0, '2025-08-14 13:23:11', '2025-08-14 13:23:11'),
(20, 3, 6, 5, 0, '2025-08-14 13:23:11', '2025-08-14 14:02:50'),
(21, 3, 7, 6, 0, '2025-08-14 13:23:11', '2025-08-14 14:02:51'),
(22, 3, 8, 7, 0, '2025-08-14 13:23:11', '2025-08-14 14:02:51'),
(24, 2, 19, 8, 0, '2025-08-14 22:30:18', '2025-08-14 22:30:18'),
(25, 1, 20, 1, 0, '2025-08-18 09:01:51', '2025-08-18 09:02:09');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `project_id` int NOT NULL,
  `category_stage_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  `component_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('not-started','in-progress','under-review','completed','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'not-started',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` int DEFAULT '0',
  `estimated_hours` decimal(8,2) DEFAULT '0.00',
  `actual_hours` decimal(8,2) DEFAULT '0.00',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `unit_id` (`unit_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_project` (`project_id`),
  KEY `idx_stage` (`category_stage_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_components` (`grade_id`,`book_id`,`unit_id`,`lesson_id`),
  KEY `idx_tasks_project_status` (`project_id`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `description`, `project_id`, `category_stage_id`, `grade_id`, `book_id`, `unit_id`, `lesson_id`, `component_path`, `status`, `priority`, `start_date`, `end_date`, `progress`, `estimated_hours`, `actual_hours`, `created_by`, `created_at`, `updated_at`) VALUES
(6, 'Hello', 'Hello', 13, 1, 9, 38, NULL, NULL, '', 'under-review', 'medium', '2025-08-18', '2025-08-25', 90, 8.00, 0.00, 1, '2025-08-18 09:18:10', '2025-08-18 10:22:57'),
(7, 'asdasd', 'sdasd', 13, 1, 9, 39, NULL, NULL, '', 'not-started', 'medium', '2025-08-18', '2025-08-25', 0, 8.00, 0.00, 1, '2025-08-18 09:24:04', '2025-08-18 09:24:04');

-- --------------------------------------------------------

--
-- Table structure for table `task_assignees`
--

DROP TABLE IF EXISTS `task_assignees`;
CREATE TABLE IF NOT EXISTS `task_assignees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `assignee_id` int NOT NULL,
  `assignee_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_task_assignee` (`task_id`,`assignee_id`,`assignee_type`),
  KEY `idx_task` (`task_id`),
  KEY `idx_assignee` (`assignee_id`,`assignee_type`),
  KEY `idx_tasks_assignee_status` (`assignee_id`,`assignee_type`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`id`, `task_id`, `assignee_id`, `assignee_type`, `created_at`) VALUES
(11, 7, 8, 'team', '2025-08-18 09:24:04'),
(12, 7, 21, 'team', '2025-08-18 09:24:04'),
(13, 7, 15, 'team', '2025-08-18 09:24:04'),
(14, 7, 9, 'team', '2025-08-18 09:24:04'),
(20, 6, 16, 'team', '2025-08-18 10:22:57'),
(21, 6, 17, 'team', '2025-08-18 10:22:57'),
(22, 6, 18, 'team', '2025-08-18 10:22:57');

-- --------------------------------------------------------

--
-- Table structure for table `task_extensions`
--

DROP TABLE IF EXISTS `task_extensions`;
CREATE TABLE IF NOT EXISTS `task_extensions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `requested_by` int NOT NULL COMMENT 'ID of the user requesting extension (team_member_id or admin_user_id)',
  `requested_by_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of user requesting extension',
  `current_due_date` date NOT NULL COMMENT 'Original due date before extension',
  `requested_due_date` date NOT NULL COMMENT 'New requested due date',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reason for extension request',
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Status of extension request',
  `reviewed_by` int DEFAULT NULL COMMENT 'ID of admin who reviewed the request',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT 'When the request was reviewed',
  `review_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes from admin review',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_requested_by` (`requested_by`,`requested_by_type`),
  KEY `idx_status` (`status`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  KEY `idx_dates` (`current_due_date`,`requested_due_date`),
  KEY `idx_task_extensions_task_status` (`task_id`,`status`),
  KEY `idx_task_extensions_requester` (`requested_by`,`requested_by_type`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track extension requests for tasks - allows team members to request deadline extensions';

--
-- Dumping data for table `task_extensions`
--

INSERT INTO `task_extensions` (`id`, `task_id`, `requested_by`, `requested_by_type`, `current_due_date`, `requested_due_date`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `review_notes`, `created_at`, `updated_at`) VALUES
(1, 7, 8, 'admin', '2025-08-25', '2025-08-27', 'Blah', 'pending', NULL, NULL, NULL, '2025-08-18 09:56:59', '2025-08-18 09:56:59');

-- --------------------------------------------------------

--
-- Table structure for table `task_remarks`
--

DROP TABLE IF EXISTS `task_remarks`;
CREATE TABLE IF NOT EXISTS `task_remarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `added_by` int NOT NULL COMMENT 'ID of the user adding remark (team_member_id or admin_user_id)',
  `added_by_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of user adding remark',
  `remark_date` date NOT NULL COMMENT 'Date for the remark (can be current date or selected date)',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The remark/comment content',
  `remark_type` enum('general','progress','issue','update','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT 'Type of remark for categorization',
  `is_private` tinyint(1) DEFAULT '0' COMMENT 'Whether remark is private (only visible to admins)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_added_by` (`added_by`,`added_by_type`),
  KEY `idx_remark_date` (`remark_date`),
  KEY `idx_remark_type` (`remark_type`),
  KEY `idx_private` (`is_private`),
  KEY `idx_task_remarks_task_date` (`task_id`,`remark_date`),
  KEY `idx_task_remarks_user` (`added_by`,`added_by_type`),
  KEY `idx_task_remarks_type` (`remark_type`,`is_private`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track remarks/comments on tasks - allows users to add notes and updates';

--
-- Dumping data for table `task_remarks`
--

INSERT INTO `task_remarks` (`id`, `task_id`, `added_by`, `added_by_type`, `remark_date`, `remark`, `remark_type`, `is_private`, `created_at`, `updated_at`) VALUES
(1, 7, 8, 'admin', '2025-08-18', 'Some Remark', 'general', 0, '2025-08-18 09:57:21', '2025-08-18 09:57:21');

-- --------------------------------------------------------

--
-- Stand-in structure for view `task_remarks_with_users`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `task_remarks_with_users`;
CREATE TABLE IF NOT EXISTS `task_remarks_with_users` (
);

-- --------------------------------------------------------

--
-- Table structure for table `task_skills`
--

DROP TABLE IF EXISTS `task_skills`;
CREATE TABLE IF NOT EXISTS `task_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_task_skill` (`task_id`,`skill_id`),
  KEY `skill_id` (`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_skills`
--

INSERT INTO `task_skills` (`id`, `task_id`, `skill_id`, `created_at`) VALUES
(4, 6, 1, '2025-08-18 10:22:57'),
(5, 6, 3, '2025-08-18 10:22:57'),
(6, 6, 5, '2025-08-18 10:22:57');

-- --------------------------------------------------------

--
-- Table structure for table `task_teams`
--

DROP TABLE IF EXISTS `task_teams`;
CREATE TABLE IF NOT EXISTS `task_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `team_id` int NOT NULL,
  `role` enum('primary','secondary','support') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'primary',
  `estimated_hours` decimal(8,2) DEFAULT '0.00',
  `actual_hours` decimal(8,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_task_team` (`task_id`,`team_id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_team` (`team_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
CREATE TABLE IF NOT EXISTS `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `functional_unit_id` int DEFAULT NULL,
  `team_lead_id` int DEFAULT NULL,
  `team_lead_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_capacity` int DEFAULT '10',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_functional_unit` (`functional_unit_id`),
  KEY `idx_team_lead` (`team_lead_id`,`team_lead_type`),
  KEY `idx_active` (`is_active`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `description`, `functional_unit_id`, `team_lead_id`, `team_lead_type`, `max_capacity`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'IT Developers', 'IT Developers', NULL, NULL, 'team', 10, 1, '2025-08-11 15:55:34', '2025-08-11 15:55:34'),
(4, 'ID/Content Writers', '', NULL, NULL, 'team', 10, 1, '2025-08-14 21:33:47', '2025-08-14 21:33:47'),
(5, 'Graphic Designers', '', NULL, NULL, 'team', 10, 1, '2025-08-14 21:35:49', '2025-08-18 13:44:51'),
(6, 'Animation', '', NULL, NULL, 'team', 10, 0, '2025-08-14 21:37:52', '2025-08-14 21:41:19'),
(7, 'Animation', '', NULL, NULL, 'team', 10, 1, '2025-08-14 21:41:26', '2025-08-14 21:41:26');

-- --------------------------------------------------------

--
-- Table structure for table `team_allocations`
--

DROP TABLE IF EXISTS `team_allocations`;
CREATE TABLE IF NOT EXISTS `team_allocations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_type` enum('admin','team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` int NOT NULL,
  `task_id` int DEFAULT NULL,
  `hours_per_day` decimal(4,2) DEFAULT '8.00',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `idx_user` (`user_id`,`user_type`),
  KEY `idx_project` (`project_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_allocations_user_dates` (`user_id`,`user_type`,`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passcode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_passcode` (`passcode`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `email`, `passcode`, `name`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'sarah.johnson@company.com', 'DEMO123', 'Sarah Johnson', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 21:36:42'),
(2, 'mike.chen@company.com', 'TECH456', 'Mikel Chen', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 21:36:36'),
(3, 'emily.rodriguez@company.com', 'DESIGN789', 'Emily Rodriguez', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 12:32:10'),
(4, 'david.kim@company.com', 'DAVID123', 'David Kim', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 12:32:14'),
(5, 'lisa.thompson@company.com', 'MARKET99', 'Lisa Thompson', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 21:36:32'),
(6, 'john.smith@company.com', 'WRITE42', 'John Smith', 0, NULL, '2025-08-09 13:56:11', '2025-08-14 12:32:12'),
(7, 'zaki@bylinelearning.com', 'ZAKI11', 'Zaki Shaikh', 0, '2025-08-14 20:54:45', '2025-08-09 18:36:07', '2025-08-18 13:45:30'),
(8, 'rahul.k@bylinelearning.com', 'RAHUL123', 'Rahul Kirad', 1, '2025-08-18 09:55:16', '2025-08-11 16:51:14', '2025-08-18 09:55:16'),
(9, 'radha@bylinelearning.com', '2019', 'Radha', 1, NULL, '2025-08-14 21:30:23', '2025-08-14 21:30:23'),
(10, 'rohan@bylinelearning.com', '2019', 'Rohan', 1, NULL, '2025-08-14 21:31:07', '2025-08-14 21:31:07'),
(11, 'vinayak@bylinelearning.com', '2019', 'Vinayak', 1, NULL, '2025-08-14 21:31:34', '2025-08-14 21:31:34'),
(12, 'aniket@bylinelearning.com', '2019', 'Aniket', 1, NULL, '2025-08-14 21:32:07', '2025-08-14 21:32:07'),
(13, 'amol@bylinelearning.com', '2019', 'Amol', 1, NULL, '2025-08-14 21:32:24', '2025-08-14 21:32:24'),
(14, 'tanmay@bylinelearning.com', '2019', 'Tanmay', 1, NULL, '2025-08-14 21:32:54', '2025-08-14 21:32:54'),
(15, 'makarand@bylinelearning.com', '2019', 'Makarand', 1, NULL, '2025-08-14 21:35:28', '2025-08-14 21:35:28'),
(16, 'rajwardhani@bylinelearning.com', '2019', 'Rajwardhani', 1, NULL, '2025-08-14 21:38:24', '2025-08-14 21:38:24'),
(17, 'shruti@bylinelearning.com', '2019', 'Shruti', 1, NULL, '2025-08-14 21:38:49', '2025-08-14 21:38:49'),
(18, 'sanket@bylinelearning.com', '2019', 'Sanket', 1, NULL, '2025-08-14 21:39:19', '2025-08-14 21:39:19'),
(19, 'shriraj@bylinelearning.com', '2019', 'Shriraj', 1, NULL, '2025-08-14 21:39:46', '2025-08-14 21:39:46'),
(20, 'swapnil@bylinelearning.com', '2019', 'Swapnil', 1, NULL, '2025-08-14 21:40:06', '2025-08-14 21:40:06'),
(21, 'bushra@bylinelearning.com', '2019', 'Bushra', 1, NULL, '2025-08-14 22:37:41', '2025-08-14 22:37:41'),
(22, 'ankita@bylinelearning.com', '2019', 'Ankita', 1, NULL, '2025-08-14 22:38:39', '2025-08-14 22:38:39'),
(23, 'nutan@bylinelearning.com', '2019', 'Nutan', 1, NULL, '2025-08-14 22:38:56', '2025-08-14 22:38:56'),
(24, 'bhyshan@bylinelearning.com', '2019', 'Bhushan', 1, NULL, '2025-08-14 22:39:38', '2025-08-14 22:39:38'),
(25, 'jitesh@bylinelearning.com', '2019', 'Jitesh', 1, NULL, '2025-08-14 22:39:59', '2025-08-14 22:40:07'),
(26, 'nikita@bylinelearning.com', '2019', 'Nikita', 1, NULL, '2025-08-14 22:40:31', '2025-08-14 22:40:31'),
(27, 'yash@bylinelearning.com', '2019', 'Yash', 1, NULL, '2025-08-14 22:40:54', '2025-08-14 22:40:54');

-- --------------------------------------------------------

--
-- Table structure for table `team_members_teams`
--

DROP TABLE IF EXISTS `team_members_teams`;
CREATE TABLE IF NOT EXISTS `team_members_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `team_member_id` int NOT NULL,
  `role` enum('lead','senior','member','junior') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `joined_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_member` (`team_id`,`team_member_id`),
  KEY `idx_team` (`team_id`),
  KEY `idx_member` (`team_member_id`),
  KEY `idx_active` (`is_active`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_members_teams`
--

INSERT INTO `team_members_teams` (`id`, `team_id`, `team_member_id`, `role`, `joined_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 7, 'member', '2025-08-11', 1, '2025-08-11 16:58:35', '2025-08-11 16:58:35'),
(2, 2, 8, 'member', '2025-08-11', 1, '2025-08-11 17:17:40', '2025-08-11 17:17:40'),
(5, 4, 9, 'member', '2025-08-14', 1, '2025-08-14 21:30:23', '2025-08-14 21:30:23'),
(6, 6, 10, 'member', '2025-08-14', 1, '2025-08-14 21:31:07', '2025-08-14 21:31:07'),
(7, 6, 11, 'member', '2025-08-14', 1, '2025-08-14 21:31:34', '2025-08-14 21:31:34'),
(10, 6, 14, 'member', '2025-08-14', 1, '2025-08-14 21:32:54', '2025-08-14 21:32:54'),
(12, 4, 15, 'member', '2025-08-14', 1, '2025-08-14 21:35:28', '2025-08-14 21:35:28'),
(39, 5, 13, 'member', '2025-08-14', 1, '2025-08-15 05:14:24', '2025-08-15 05:14:24'),
(40, 5, 12, 'member', '2025-08-14', 1, '2025-08-15 05:14:49', '2025-08-15 05:14:49'),
(15, 5, 10, 'member', '2025-08-14', 1, '2025-08-14 21:36:08', '2025-08-14 21:36:08'),
(16, 5, 14, 'member', '2025-08-14', 1, '2025-08-14 21:36:14', '2025-08-14 21:36:14'),
(17, 5, 11, 'member', '2025-08-14', 1, '2025-08-14 21:36:18', '2025-08-14 21:36:18'),
(18, 6, 16, 'member', '2025-08-14', 1, '2025-08-14 21:38:24', '2025-08-14 21:38:24'),
(19, 6, 17, 'member', '2025-08-14', 1, '2025-08-14 21:38:49', '2025-08-14 21:38:49'),
(20, 6, 18, 'member', '2025-08-14', 1, '2025-08-14 21:39:19', '2025-08-14 21:39:19'),
(21, 6, 19, 'member', '2025-08-14', 1, '2025-08-14 21:39:46', '2025-08-14 21:39:46'),
(22, 6, 20, 'member', '2025-08-14', 1, '2025-08-14 21:40:06', '2025-08-14 21:40:06'),
(23, 7, 16, 'member', '2025-08-14', 1, '2025-08-14 21:41:36', '2025-08-14 21:41:36'),
(24, 7, 20, 'member', '2025-08-14', 1, '2025-08-14 21:41:45', '2025-08-14 21:41:45'),
(25, 7, 19, 'member', '2025-08-14', 1, '2025-08-14 21:41:53', '2025-08-14 21:41:53'),
(26, 7, 17, 'member', '2025-08-14', 1, '2025-08-14 21:41:59', '2025-08-14 21:41:59'),
(27, 7, 18, 'member', '2025-08-14', 1, '2025-08-14 21:42:04', '2025-08-14 21:42:04'),
(28, 4, 21, 'member', '2025-08-14', 1, '2025-08-14 22:37:41', '2025-08-14 22:37:41'),
(29, 5, 22, 'member', '2025-08-14', 1, '2025-08-14 22:38:39', '2025-08-14 22:38:39'),
(30, 5, 23, 'member', '2025-08-14', 1, '2025-08-14 22:38:56', '2025-08-14 22:38:56'),
(31, 5, 24, 'member', '2025-08-14', 1, '2025-08-14 22:39:38', '2025-08-14 22:39:38'),
(33, 5, 26, 'member', '2025-08-14', 1, '2025-08-14 22:40:31', '2025-08-14 22:40:31'),
(34, 5, 27, 'member', '2025-08-14', 1, '2025-08-14 22:40:54', '2025-08-14 22:40:54'),
(41, 5, 7, 'member', '2025-08-18', 1, '2025-08-18 13:44:14', '2025-08-18 13:44:14');

-- --------------------------------------------------------

--
-- Table structure for table `team_member_sessions`
--

DROP TABLE IF EXISTS `team_member_sessions`;
CREATE TABLE IF NOT EXISTS `team_member_sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_member_id` int NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_team_member` (`team_member_id`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_member_skills`
--

DROP TABLE IF EXISTS `team_member_skills`;
CREATE TABLE IF NOT EXISTS `team_member_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_member_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member_skill` (`team_member_id`,`skill_id`),
  KEY `skill_id` (`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_member_skills`
--

INSERT INTO `team_member_skills` (`id`, `team_member_id`, `skill_id`, `created_at`) VALUES
(5, 8, 6, '2025-08-11 16:51:14'),
(6, 8, 4, '2025-08-11 16:51:14'),
(13, 7, 4, '2025-08-11 16:58:35'),
(14, 7, 6, '2025-08-11 16:58:35'),
(21, 4, 5, '2025-08-11 17:42:00'),
(22, 4, 3, '2025-08-11 17:42:00'),
(23, 2, 7, '2025-08-11 17:46:21'),
(24, 2, 6, '2025-08-11 17:46:21'),
(25, 9, 1, '2025-08-14 21:30:23'),
(26, 10, 3, '2025-08-14 21:31:07'),
(27, 11, 3, '2025-08-14 21:31:34'),
(30, 14, 3, '2025-08-14 21:32:54'),
(31, 15, 1, '2025-08-14 21:35:28'),
(32, 16, 5, '2025-08-14 21:38:24'),
(33, 17, 5, '2025-08-14 21:38:49'),
(34, 18, 5, '2025-08-14 21:39:19'),
(35, 19, 5, '2025-08-14 21:39:46'),
(36, 20, 5, '2025-08-14 21:40:06'),
(37, 21, 2, '2025-08-14 22:37:41'),
(38, 22, 3, '2025-08-14 22:38:39'),
(39, 23, 3, '2025-08-14 22:38:56'),
(40, 24, 3, '2025-08-14 22:39:38'),
(42, 25, 3, '2025-08-14 22:40:07'),
(43, 26, 3, '2025-08-14 22:40:31'),
(44, 27, 3, '2025-08-14 22:40:54'),
(46, 13, 3, '2025-08-15 05:14:24');

-- --------------------------------------------------------

--
-- Table structure for table `team_performance`
--

DROP TABLE IF EXISTS `team_performance`;
CREATE TABLE IF NOT EXISTS `team_performance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `project_id` int DEFAULT NULL,
  `metric_type` enum('productivity','quality','timeliness','collaboration') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_value` decimal(5,2) NOT NULL,
  `metric_date` date NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_team` (`team_id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_metric_date` (`metric_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_skills`
--

DROP TABLE IF EXISTS `team_skills`;
CREATE TABLE IF NOT EXISTS `team_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'intermediate',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_skill` (`team_id`,`skill_id`),
  KEY `idx_team` (`team_id`),
  KEY `idx_skill` (`skill_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_skills`
--

INSERT INTO `team_skills` (`id`, `team_id`, `skill_id`, `proficiency_level`, `created_at`) VALUES
(1, 3, 10, 'intermediate', '2025-08-11 16:00:01');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `weight` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_book` (`book_id`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `task_remarks_with_users`
--
DROP TABLE IF EXISTS `task_remarks_with_users`;

DROP VIEW IF EXISTS `task_remarks_with_users`;
CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_byp5e849n5`@`localhost` SQL SECURITY DEFINER VIEW `task_remarks_with_users`  AS SELECT `tr`.`id` AS `id`, `tr`.`task_id` AS `task_id`, `t`.`name` AS `task_name`, `tr`.`added_by` AS `added_by`, `tr`.`added_by_type` AS `added_by_type`, (case when (`tr`.`added_by_type` = 'team') then `tm`.`name` when (`tr`.`added_by_type` = 'admin') then `au`.`name` else 'Unknown' end) AS `user_name`, `tr`.`remark_date` AS `remark_date`, `tr`.`remark` AS `remark`, `tr`.`remark_type` AS `remark_type`, `tr`.`is_private` AS `is_private`, `tr`.`created_at` AS `created_at` FROM (((`task_remarks` `tr` join `tasks` `t` on((`tr`.`task_id` = `t`.`id`))) left join `team_members` `tm` on(((`tr`.`added_by` = `tm`.`id`) and (`tr`.`added_by_type` = 'team')))) left join `admin_users` `au` on(((`tr`.`added_by` = `au`.`id`) and (`tr`.`added_by_type` = 'admin')))) ORDER BY `tr`.`remark_date` DESC, `tr`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users` ADD FULLTEXT KEY `name` (`name`,`email`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects` ADD FULLTEXT KEY `name` (`name`,`description`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks` ADD FULLTEXT KEY `name` (`name`,`description`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members` ADD FULLTEXT KEY `name` (`name`,`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admin_user_skills`
--
ALTER TABLE `admin_user_skills`
  ADD CONSTRAINT `admin_user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_user_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `functional_unit_skills`
--
ALTER TABLE `functional_unit_skills`
  ADD CONSTRAINT `functional_unit_skills_ibfk_1` FOREIGN KEY (`functional_unit_id`) REFERENCES `functional_units` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `functional_unit_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_flags`
--
ALTER TABLE `performance_flags`
  ADD CONSTRAINT `performance_flags_ibfk_1` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_current_stage_fk` FOREIGN KEY (`current_stage_id`) REFERENCES `category_stages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_rounds`
--
ALTER TABLE `review_rounds`
  ADD CONSTRAINT `review_rounds_ibfk_1` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_round_reviewers`
--
ALTER TABLE `review_round_reviewers`
  ADD CONSTRAINT `review_round_reviewers_ibfk_1` FOREIGN KEY (`review_round_id`) REFERENCES `review_rounds` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stages`
--
ALTER TABLE `stages`
  ADD CONSTRAINT `stages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stages_ibfk_2` FOREIGN KEY (`parent_stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stage_templates`
--
ALTER TABLE `stage_templates`
  ADD CONSTRAINT `stage_templates_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stage_templates_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `category_stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`category_stage_id`) REFERENCES `category_stages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_6` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_7` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD CONSTRAINT `task_assignees_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_extensions`
--
ALTER TABLE `task_extensions`
  ADD CONSTRAINT `fk_task_extensions_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_task_extensions_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_remarks`
--
ALTER TABLE `task_remarks`
  ADD CONSTRAINT `fk_task_remarks_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_skills`
--
ALTER TABLE `task_skills`
  ADD CONSTRAINT `task_skills_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_allocations`
--
ALTER TABLE `team_allocations`
  ADD CONSTRAINT `team_allocations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_allocations_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_member_sessions`
--
ALTER TABLE `team_member_sessions`
  ADD CONSTRAINT `team_member_sessions_ibfk_1` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_member_skills`
--
ALTER TABLE `team_member_skills`
  ADD CONSTRAINT `team_member_skills_ibfk_1` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_member_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
