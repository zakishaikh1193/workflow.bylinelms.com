-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 15, 2025 at 09:42 AM
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
('admin_1_1755512430157', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEyNDMwLCJleHAiOjE3NTU1OTg4MzB9.MnXwI2BqOor5lMkJse_6XzEh23xeWf7XAkJIusGZ7vw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTEyNDMwLCJleHAiOjE3NTYxMTcyMzB9.mhK1xiDUrhR2Xodhnjk0AI4G5bTTsgQb_XXl-CInneQ', '2025-08-19 10:20:30', '2025-08-18 10:20:30', '2025-08-18 10:20:30'),
('admin_1_1755514198395', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE0MTk4LCJleHAiOjE3NTU2MDA1OTh9.PVXN6AYG2xDX4RObYpm7HzbJu9sQy7ENTGpq4rXXRIw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE0MTk4LCJleHAiOjE3NTYxMTg5OTh9.cqUtIwr3XMWKO0xq2HfG9raTHlJX5iOIkjac3aNkPhs', '2025-08-19 10:49:58', '2025-08-18 10:49:58', '2025-08-18 10:49:58'),
('admin_1_1755518381720', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE4MzgxLCJleHAiOjE3NTU2MDQ3ODF9.4jpV2um8-4lwpMB-x1CayZV0XUzL106S5hE5udPyUFQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE4MzgxLCJleHAiOjE3NTYxMjMxODF9.Jse9blzLM4SPClEksbEnzIIpd-M4CCe2M09i0ZYt51c', '2025-08-19 11:59:41', '2025-08-18 11:59:41', '2025-08-18 11:59:41'),
('admin_1_1755518658212', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE4NjU4LCJleHAiOjE3NTU2MDUwNTh9.HBqVn9WUclv3jVzqd6TYkgtbuUIKpMHsUIy91yOThOA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTE4NjU4LCJleHAiOjE3NTYxMjM0NTh9.zcfG8OXP7JpS8VFfIl6bRpj98JJe4j_oiBxCI0mFHoA', '2025-08-19 12:04:18', '2025-08-18 12:04:18', '2025-08-18 12:04:18'),
('admin_1_1755521184482', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTIxMTg0LCJleHAiOjE3NTU2MDc1ODR9.1dUrj1Yw3K8R7m3yf-xXZBx7ulHJXNZKIiX5YDmzpn8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTIxMTg0LCJleHAiOjE3NTYxMjU5ODR9.k7sJmJV2wSadTcmG1J6pFlthavz4vsddrQfri1hOz7E', '2025-08-19 12:46:24', '2025-08-18 12:46:24', '2025-08-18 12:46:24'),
('admin_1_1755521267813', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTIxMjY3LCJleHAiOjE3NTU2MDc2Njd9.T7df-MzR_Zo3yQkU9Wnydlja0L5EVF89adf4lUzeH6Q', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NTIxMjY3LCJleHAiOjE3NTYxMjYwNjd9.OZeLFtNedfpexXrCdZCJysbHaq_JSBuJHPZ-WBO1c1g', '2025-08-19 12:47:47', '2025-08-18 12:47:47', '2025-08-18 12:47:47'),
('admin_1_1755602959835', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NjAyOTU5LCJleHAiOjE3NTU2ODkzNTl9.coDbGGWfSpmobLiVodeB6xIton-4mj2MJmn_MQ3cYdY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1NjAyOTU5LCJleHAiOjE3NTYyMDc3NTl9.z7Zx5X2akx0RwVq6voS7Gc1GBLAp5O7FJbb2OAJYRGw', '2025-08-20 11:29:19', '2025-08-19 11:29:19', '2025-08-19 11:29:19'),
('admin_1_1755869330438', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODY5MzMwLCJleHAiOjE3NTU5NTU3MzB9.x-CbDzoHLK6po_I1L4RjzeSxUO28yGipb41ZUiRTe2k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODY5MzMwLCJleHAiOjE3NTY0NzQxMzB9.-1mv6MdcZ-qSK0eNWL8-KkmUuzKgITdIDJSVAY4np3k', '2025-08-23 13:28:50', '2025-08-22 13:28:50', '2025-08-22 13:28:50'),
('admin_1_1755870557113', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODcwNTU3LCJleHAiOjE3NTU5NTY5NTd9.nbg5CjjT83pgkpvRhMFd1E7jW8iv6sSEewT4veixy0o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODcwNTU3LCJleHAiOjE3NTY0NzUzNTd9.BTdJqqQ_kxxunqmT7S718zWWBcCf_4vglEGST9xYSkU', '2025-08-23 13:49:17', '2025-08-22 13:49:17', '2025-08-22 13:49:17'),
('admin_1_1755875505645', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODc1NTA1LCJleHAiOjE3NTU5NjE5MDV9.tRWlqd3t5xsHvC1dhm6aJ4gl_OmgDbvaB4_hK25S9RU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODc1NTA1LCJleHAiOjE3NTY0ODAzMDV9.LV1Xm83T9cMa1ZI9ubkG8JEX2zaM_b7pA53kt7aNLzQ', '2025-08-23 15:11:45', '2025-08-22 15:11:45', '2025-08-22 15:11:45'),
('admin_1_1755875597327', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODc1NTk3LCJleHAiOjE3NTU5NjE5OTd9.-v3UDOX9W1Cie4Q1bUKedImm7dnSIdoJ_l9axFoabvA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU1ODc1NTk3LCJleHAiOjE3NTY0ODAzOTd9.wQkwsbbnjb_nnW_uAguBeEUBTHqNHWu8Pj1ecwfFNM8', '2025-08-23 15:13:17', '2025-08-22 15:13:17', '2025-08-22 15:13:17'),
('admin_1_1756807073431', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODA3MDczLCJleHAiOjE3NTY4OTM0NzN9.PvLEbNLdUTh8zflF-l6Drh0O1oLUhdmor0QY_-OWXUY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODA3MDczLCJleHAiOjE3NTc0MTE4NzN9.zEIP8PngacENOpn6UkQ4m8iBFdj1vGofIrTpUlLiSbo', '2025-09-03 09:57:53', '2025-09-02 09:57:53', '2025-09-02 09:57:53'),
('admin_1_1756808736728', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODA4NzM2LCJleHAiOjE3NTY4OTUxMzZ9.Lxof0wJaC8-6T0tbbbw0-mThfq394m1H3HD2jmBg9nE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODA4NzM2LCJleHAiOjE3NTc0MTM1MzZ9.Zy0CGsqglMwn6xPjriD5gXbGlETGKZrfkLWT1CEU2Bo', '2025-09-03 10:25:36', '2025-09-02 10:25:36', '2025-09-02 10:25:36'),
('admin_1_1756822408186', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyNDA4LCJleHAiOjE3NTY5MDg4MDh9.POzCIk3NIyt2n66z3aclgfc_0KtBJgtH5Y1eqoIusnk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyNDA4LCJleHAiOjE3NTc0MjcyMDh9.rlIKgC16J3Nm6LYtHcR-Q7csYQG4sk1-R51VOZDwgkU', '2025-09-03 14:13:28', '2025-09-02 14:13:28', '2025-09-02 14:13:28'),
('admin_1_1756822711869', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyNzExLCJleHAiOjE3NTY5MDkxMTF9.wl8mLK0npmnLCUcVjfwvg2r9_hwl25r3gPt6IPlX0dk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyNzExLCJleHAiOjE3NTc0Mjc1MTF9.eEJNF-nOkAurW-km52ZP4E25h5tggMjcpbPNdnzihtM', '2025-09-03 14:18:31', '2025-09-02 14:18:31', '2025-09-02 14:18:31'),
('admin_1_1756822835918', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyODM1LCJleHAiOjE3NTY5MDkyMzV9.AG2mGYmKIAgYdko-eo1f9rfIYNUvhSlR5qTvy9QwNkY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyODM1LCJleHAiOjE3NTc0Mjc2MzV9.qHQlgOF6vzKAbrdfKzg3Oe2T9w9k7Ciky7rreJ4YFYI', '2025-09-03 14:20:35', '2025-09-02 14:20:35', '2025-09-02 14:20:35'),
('admin_1_1756822874810', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyODc0LCJleHAiOjE3NTY5MDkyNzR9.tLpyo3DWmPoRtEzSVx9I1SSILBnKgVzCwg3RwNAq6gM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU2ODIyODc0LCJleHAiOjE3NTc0Mjc2NzR9.GwA6vGDxFepWKb5dH-EuSZJuk84BuNiqbn6zeAkgcTk', '2025-09-03 14:21:14', '2025-09-02 14:21:14', '2025-09-02 14:21:14'),
('admin_1_1757760048538', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzYwMDQ4LCJleHAiOjE3NTg2MjQwNDh9.psY5cF5vaKkJFo_6qJKr69pvJSaJrV4C8d8qGN22fZM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzYwMDQ4LCJleHAiOjE3NTk0ODgwNDh9.P-CBqfHNkLfNpWUY4fN0MYvihtuwAdeG9xmVZQfkWqY', '2025-09-23 10:40:48', '2025-09-13 10:40:48', '2025-09-13 10:40:48'),
('admin_1_1757760957707', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzYwOTU3LCJleHAiOjE3NTg2MjQ5NTd9.IUmFl2QdBUBU5tZ2VSewLg5IU70CJmS4u-N7DrH5Aag', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzYwOTU3LCJleHAiOjE3NTk0ODg5NTd9.GKMCpeWEOjj30NuspsIw8UU_lWq2m4Tec4Y6JC13EbM', '2025-09-23 10:55:57', '2025-09-13 10:55:57', '2025-09-13 10:55:57'),
('admin_1_1757764741030', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY0NzQxLCJleHAiOjE3NTg2Mjg3NDF9.9riehKOeBRWJoLVi9B47cBoPe4fhxMvzb59prt5xP6U', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY0NzQxLCJleHAiOjE3NTk0OTI3NDF9.xGkMzJpFozIq2Rmxmcl_X4Ge5pdAjLEp6FhkQPr2azc', '2025-09-23 11:59:01', '2025-09-13 11:59:01', '2025-09-13 11:59:01'),
('admin_1_1757767888747', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY3ODg4LCJleHAiOjE3NTg2MzE4ODh9.1MObBvrtA_tME58Ky3LdMwKJBFfre3ILnbeazkxCP8Q', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY3ODg4LCJleHAiOjE3NTk0OTU4ODh9.G5sp8UCY3HWb2eACrHYnZrNyl-GH1qdfFioX04gMHZw', '2025-09-23 12:51:28', '2025-09-13 12:51:28', '2025-09-13 12:51:28'),
('admin_1_1757767923834', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY3OTIzLCJleHAiOjE3NTg2MzE5MjN9.S_2cjMcqZACml74vzxwOOZPjFm7qpVqEqXMxtZq-vtY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3NzY3OTIzLCJleHAiOjE3NTk0OTU5MjN9.Syu4GFfZvSavST_rqh3iAXu9zwMPvVEQeQOEz6JcuJg', '2025-09-23 12:52:03', '2025-09-13 12:52:03', '2025-09-13 12:52:03'),
('admin_1_1757916040491', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3OTE2MDQwLCJleHAiOjE3NTg3ODAwNDB9.hHYpPEoMbah7a1sNIbP0t6Ai7MwkW4nGpPUKjyxu4lY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3OTE2MDQwLCJleHAiOjE3NTk2NDQwNDB9.ttwDF_JCnadd1mK7R7YZfyY5bTMbcqWAgjzD55uPzFY', '2025-09-25 06:00:40', '2025-09-15 06:00:40', '2025-09-15 06:00:40'),
('admin_1_1757928856969', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpbmZvQGJ5bGluZWxlYXJuaW5nLmNvbSIsIm5hbWUiOiJEZW1vIEFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3OTI4ODU2LCJleHAiOjE3NTg3OTI4NTZ9.18z1b5Bn-cXjsSuTJUmxt2D6C52GIqUb2wwnlBuC8qI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3OTI4ODU2LCJleHAiOjE3NTk2NTY4NTZ9.mHMr_GExIsey8OtY-F90_HGQINCU1RiDwGzv5Nthbv0', '2025-09-25 09:34:16', '2025-09-15 09:34:16', '2025-09-15 09:34:16');

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
(1, 'info@bylinelearning.com', '$2b$10$U0wXs2mwUNm3OTBCAEFeNOhvYEUjJcWag7YIwxUgaz9F9CFqx7j1m', 'Demo Admin', NULL, 1, '2025-09-15 09:34:16', '2025-08-09 13:56:11', '2025-08-09 13:56:11', '2025-09-15 09:34:16');

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
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `grade_id`, `name`, `type`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(89, 20, 'U1', 'student', 'U1', 1, 5.00, '2025-09-02 10:03:35', '2025-09-02 10:03:43'),
(93, 20, 'U2', 'student', 'U2', 2, 5.00, '2025-09-02 10:05:30', '2025-09-02 10:05:30'),
(94, 21, 'L1', 'student', 'L1', 1, 5.00, '2025-09-02 10:06:00', '2025-09-02 10:06:00'),
(95, 21, 'L2', 'student', 'L2', 2, 5.00, '2025-09-02 10:06:11', '2025-09-02 10:06:11'),
(96, 26, 'U5', 'student', 'U5', 1, 0.00, '2025-09-12 12:33:11', '2025-09-12 13:18:11'),
(97, 27, 'U2', 'student', 'U2', 1, 0.00, '2025-09-12 12:33:27', '2025-09-12 12:33:27'),
(98, 28, 'U3', 'student', 'U3', 1, 0.00, '2025-09-12 12:34:02', '2025-09-12 12:34:02'),
(99, 26, 'U8', 'student', NULL, 2, 0.00, '2025-09-12 13:18:51', '2025-09-12 13:18:51'),
(100, 26, 'U9', 'student', NULL, 3, 0.00, '2025-09-12 13:19:06', '2025-09-12 13:19:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'eLearning Design', 'Interactive online learning content and courses', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(2, 'Curriculum Design', 'Educational curriculum and instructional materials', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(3, 'IT Applications', 'Software development and technical solutions', 1, '2025-08-09 13:56:11', '2025-08-09 13:56:11'),
(4, 'Web Development', 'Website and web application projects', 0, '2025-08-09 16:45:32', '2025-08-09 16:45:32'),
(6, 'Data Analysis', 'Data science and analytics projects', 0, '2025-08-09 16:45:32', '2025-08-09 16:45:32'),
(7, 'New Category', '', 0, '2025-09-02 12:57:56', '2025-09-02 12:57:56');

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(20, 'Test Stage', 'Test Stage', 9, 1, '2025-08-18 09:01:51', '2025-08-18 09:01:51'),
(21, 'Stage 1', NULL, 1, 1, '2025-09-02 12:58:03', '2025-09-02 12:58:03');

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `project_id`, `name`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(20, 16, 'G1', NULL, 1, 20.00, '2025-09-02 10:03:09', '2025-09-02 10:03:09'),
(21, 16, 'G2', NULL, 2, 20.00, '2025-09-02 10:03:14', '2025-09-02 10:03:14'),
(22, 16, 'G3', NULL, 3, 20.00, '2025-09-02 10:03:19', '2025-09-02 10:03:19'),
(23, 16, 'G4', NULL, 4, 20.00, '2025-09-02 10:03:24', '2025-09-02 10:03:24'),
(24, 17, 'g1', NULL, 1, 0.00, '2025-09-02 10:51:29', '2025-09-02 10:51:29'),
(25, 18, 'G1', 'G1', 1, 0.00, '2025-09-12 12:32:52', '2025-09-12 12:32:52'),
(26, 18, 'G2', 'G2', 2, 0.00, '2025-09-12 12:32:58', '2025-09-12 12:32:58'),
(27, 18, 'G3', 'G3', 3, 0.00, '2025-09-12 12:33:18', '2025-09-12 12:33:18'),
(28, 18, 'G4', 'G4\n', 4, 0.00, '2025-09-12 12:33:51', '2025-09-12 12:33:51');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `unit_id`, `name`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(1, 3, 'Lesson 1', 'Lesson 1', 1, 0.00, '2025-09-02 13:26:45', '2025-09-02 13:26:45'),
(2, 12, 'M1', NULL, 1, 0.00, '2025-09-12 12:34:17', '2025-09-12 12:34:17'),
(3, 14, 'asdcbcx', 'bfgb', 1, 0.00, '2025-09-12 13:19:19', '2025-09-12 13:19:19');

-- --------------------------------------------------------

--
-- Table structure for table `performance_flags`
--

DROP TABLE IF EXISTS `performance_flags`;
CREATE TABLE IF NOT EXISTS `performance_flags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_member_id` int NOT NULL,
  `task_id` int DEFAULT NULL,
  `type` enum('red','orange','yellow','green') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_by_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_team_member` (`team_member_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_performance_flags_member_type` (`team_member_id`,`type`),
  KEY `idx_task` (`task_id`),
  KEY `idx_added_by` (`added_by_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance_flags`
--

INSERT INTO `performance_flags` (`id`, `team_member_id`, `task_id`, `type`, `reason`, `added_by`, `added_by_id`, `created_at`) VALUES
(1, 8, NULL, 'green', 'abc', 'Demo Admin', 1, '2025-08-18 12:02:33'),
(2, 8, NULL, 'green', 'Reason', 'Demo Admin', 1, '2025-08-18 12:28:16'),
(4, 30, NULL, 'red', 'ads', 'Demo Admin', 1, '2025-08-22 13:52:34'),
(5, 33, 1821, 'green', 'Reason', 'Demo Admin', 1, '2025-09-12 09:08:20');

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `category_id`, `current_stage_id`, `status`, `start_date`, `end_date`, `progress`, `created_by`, `parent_id`, `created_at`, `updated_at`) VALUES
(16, 'ICT Standard', 'ICT Standard', 2, NULL, 'planning', '2025-09-02', '2025-10-31', 11, 1, NULL, '2025-09-02 10:02:59', '2025-09-15 07:59:57'),
(17, 'S', NULL, 2, NULL, 'planning', '2025-09-02', '2025-10-02', 0, 1, NULL, '2025-09-02 10:47:55', '2025-09-02 10:47:55'),
(18, 'Project 1', '', 7, NULL, 'planning', '2025-09-02', '2025-10-02', 0, 1, NULL, '2025-09-02 12:58:14', '2025-09-02 12:58:46');

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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(7, 1, 7, 8, 0, '2025-08-14 13:23:11', '2025-09-01 07:59:33'),
(8, 1, 8, 9, 0, '2025-08-14 13:23:11', '2025-09-01 07:59:33'),
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
(25, 1, 20, 1, 0, '2025-08-18 09:01:51', '2025-08-18 09:02:09'),
(26, 7, 21, 1, 0, '2025-09-02 12:58:03', '2025-09-02 12:58:03');

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
  `status` enum('not-started','in-progress','under-review','completed','blocked','skipped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'not-started',
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
) ENGINE=InnoDB AUTO_INCREMENT=1923 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `description`, `project_id`, `category_stage_id`, `grade_id`, `book_id`, `unit_id`, `lesson_id`, `component_path`, `status`, `priority`, `start_date`, `end_date`, `progress`, `estimated_hours`, `actual_hours`, `created_by`, `created_at`, `updated_at`) VALUES
(1816, 'G1 > U1 > L1 - Requirements Analysis', 'Task for G1 > U1 > L1 at Requirements Analysis stage', 16, 9, 20, 89, 3, NULL, 'G1 > U1 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1817, 'G1 > U1 > L1 - System Design', 'Task for G1 > U1 > L1 at System Design stage', 16, 10, 20, 89, 3, NULL, 'G1 > U1 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1818, 'G1 > U1 > L1 - Implementation', 'Task for G1 > U1 > L1 at Implementation stage', 16, 11, 20, 89, 3, NULL, 'G1 > U1 > L1', 'under-review', 'medium', '2025-09-02', '2025-08-27', 90, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-15 07:39:22'),
(1819, 'G1 > U1 > L1 - Testing', 'Task for G1 > U1 > L1 at Testing stage', 16, 12, 20, 89, 3, NULL, 'G1 > U1 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1820, 'G1 > U1 > L1 - Documentation', 'Task for G1 > U1 > L1 at Documentation stage', 16, 13, 20, 89, 3, NULL, 'G1 > U1 > L1', 'completed', 'medium', '2025-09-02', '2025-08-26', 100, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-15 06:57:44'),
(1821, 'G1 > U1 > L1 - Deployment', 'Task for G1 > U1 > L1 at Deployment stage', 16, 14, 20, 89, 3, NULL, 'G1 > U1 > L1', 'skipped', 'medium', '2025-09-02', '2025-08-25', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-15 07:26:45'),
(1822, 'G1 > U1 > L1 - Maintenance', 'Task for G1 > U1 > L1 at Maintenance stage', 16, 15, 20, 89, 3, NULL, 'G1 > U1 > L1', 'skipped', 'medium', '2025-09-02', '2025-09-13', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-15 07:24:26'),
(1824, 'G1 > U2 > L1 - Requirements Analysis', 'Task for G1 > U2 > L1 at Requirements Analysis stage', 16, 9, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1825, 'G1 > U2 > L1 - System Design', 'Task for G1 > U2 > L1 at System Design stage', 16, 10, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1826, 'G1 > U2 > L1 - Implementation', 'Task for G1 > U2 > L1 at Implementation stage', 16, 11, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1827, 'G1 > U2 > L1 - Testing', 'Task for G1 > U2 > L1 at Testing stage', 16, 12, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1828, 'G1 > U2 > L1 - Documentation', 'Task for G1 > U2 > L1 at Documentation stage', 16, 13, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1829, 'G1 > U2 > L1 - Deployment', 'Task for G1 > U2 > L1 at Deployment stage', 16, 14, 20, 93, 9, NULL, 'G1 > U2 > L1', 'in-progress', 'medium', '2025-09-02', '2025-09-03', 50, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:38:58'),
(1830, 'G1 > U2 > L1 - Maintenance', 'Task for G1 > U2 > L1 at Maintenance stage', 16, 15, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1832, 'G1 > U1 > L2 - Requirements Analysis', 'Task for G1 > U1 > L2 at Requirements Analysis stage', 16, 9, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1833, 'G1 > U1 > L2 - System Design', 'Task for G1 > U1 > L2 at System Design stage', 16, 10, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1834, 'G1 > U1 > L2 - Implementation', 'Task for G1 > U1 > L2 at Implementation stage', 16, 11, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1835, 'G1 > U1 > L2 - Testing', 'Task for G1 > U1 > L2 at Testing stage', 16, 12, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1836, 'G1 > U1 > L2 - Documentation', 'Task for G1 > U1 > L2 at Documentation stage', 16, 13, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1837, 'G1 > U1 > L2 - Deployment', 'Task for G1 > U1 > L2 at Deployment stage', 16, 14, 20, 89, 4, NULL, 'G1 > U1 > L2', 'skipped', 'medium', '2025-09-02', '2025-08-29', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-15 07:26:21'),
(1838, 'G1 > U1 > L2 - Maintenance', 'Task for G1 > U1 > L2 at Maintenance stage', 16, 15, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1840, 'G1 > U2 > L2 - Requirements Analysis', 'Task for G1 > U2 > L2 at Requirements Analysis stage', 16, 9, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1841, 'G1 > U2 > L2 - System Design', 'Task for G1 > U2 > L2 at System Design stage', 16, 10, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1842, 'G1 > U2 > L2 - Implementation', 'Task for G1 > U2 > L2 at Implementation stage', 16, 11, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1843, 'G1 > U2 > L2 - Testing', 'Task for G1 > U2 > L2 at Testing stage', 16, 12, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1844, 'G1 > U2 > L2 - Documentation', 'Task for G1 > U2 > L2 at Documentation stage', 16, 13, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1845, 'G1 > U2 > L2 - Deployment', 'Task for G1 > U2 > L2 at Deployment stage', 16, 14, 20, 93, 10, NULL, 'G1 > U2 > L2', 'under-review', 'medium', '2025-09-02', '2025-10-31', 90, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-13 13:08:38'),
(1846, 'G1 > U2 > L2 - Maintenance', 'Task for G1 > U2 > L2 at Maintenance stage', 16, 15, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1849, 'G1 > U1 > L3 - System Design', 'Task for G1 > U1 > L3 at System Design stage', 16, 10, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1850, 'G1 > U1 > L3 - Implementation', 'Task for G1 > U1 > L3 at Implementation stage', 16, 11, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1851, 'G1 > U1 > L3 - Testing', 'Task for G1 > U1 > L3 at Testing stage', 16, 12, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1852, 'G1 > U1 > L3 - Documentation', 'Task for G1 > U1 > L3 at Documentation stage', 16, 13, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1853, 'G1 > U1 > L3 - Deployment', 'Task for G1 > U1 > L3 at Deployment stage', 16, 14, 20, 89, 5, NULL, 'G1 > U1 > L3', 'completed', 'medium', '2025-09-02', '2025-08-25', 100, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:38:18'),
(1854, 'G1 > U1 > L3 - Maintenance', 'Task for G1 > U1 > L3 at Maintenance stage', 16, 15, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1856, 'G1 > U1 > L4 - Requirements Analysis', 'Task for G1 > U1 > L4 at Requirements Analysis stage', 16, 9, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1857, 'G1 > U1 > L4 - System Design', 'Task for G1 > U1 > L4 at System Design stage', 16, 10, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1858, 'G1 > U1 > L4 - Implementation', 'Task for G1 > U1 > L4 at Implementation stage', 16, 11, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1859, 'G1 > U1 > L4 - Testing', 'Task for G1 > U1 > L4 at Testing stage', 16, 12, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1860, 'G1 > U1 > L4 - Documentation', 'Task for G1 > U1 > L4 at Documentation stage', 16, 13, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1861, 'G1 > U1 > L4 - Deployment', 'Task for G1 > U1 > L4 at Deployment stage', 16, 14, 20, 89, 6, NULL, 'G1 > U1 > L4', 'completed', 'medium', '2025-09-02', '2025-08-26', 100, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:38:32'),
(1862, 'G1 > U1 > L4 - Maintenance', 'Task for G1 > U1 > L4 at Maintenance stage', 16, 15, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1864, 'G1 > U1 > L5 - Requirements Analysis', 'Task for G1 > U1 > L5 at Requirements Analysis stage', 16, 9, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1865, 'G1 > U1 > L5 - System Design', 'Task for G1 > U1 > L5 at System Design stage', 16, 10, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1866, 'G1 > U1 > L5 - Implementation', 'Task for G1 > U1 > L5 at Implementation stage', 16, 11, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1867, 'G1 > U1 > L5 - Testing', 'Task for G1 > U1 > L5 at Testing stage', 16, 12, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1868, 'G1 > U1 > L5 - Documentation', 'Task for G1 > U1 > L5 at Documentation stage', 16, 13, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1870, 'G1 > U1 > L5 - Maintenance', 'Task for G1 > U1 > L5 at Maintenance stage', 16, 15, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:34', '2025-09-02 10:07:34'),
(1892, 'G3 - Deployment', 'Task for G3 at Deployment stage', 16, 14, 22, NULL, NULL, NULL, 'G3', 'under-review', 'medium', '2025-09-02', '2025-09-17', 90, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-15 08:38:15'),
(1893, 'G3 - Maintenance', 'Task for G3 at Maintenance stage', 16, 15, 22, NULL, NULL, NULL, 'G3', 'under-review', 'medium', '2025-09-02', '2025-10-13', 90, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-13 13:08:56'),
(1895, 'G4 - Requirements Analysis', 'Task for G4 at Requirements Analysis stage', 16, 9, 23, NULL, NULL, NULL, 'G4', 'completed', 'medium', '2025-09-02', '2025-09-13', 100, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-15 07:03:26'),
(1896, 'G4 - System Design', 'Task for G4 at System Design stage', 16, 10, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1897, 'G4 - Implementation', 'Task for G4 at Implementation stage', 16, 11, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1898, 'G4 - Testing', 'Task for G4 at Testing stage', 16, 12, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1899, 'G4 - Documentation', 'Task for G4 at Documentation stage', 16, 13, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1900, 'G4 - Deployment', 'Task for G4 at Deployment stage', 16, 14, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1901, 'G4 - Maintenance', 'Task for G4 at Maintenance stage', 16, 15, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-02', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-02 10:07:35', '2025-09-02 10:07:35'),
(1903, 'G1 > U1 > L1 > Lesson 1 - QA', 'Task for G1 > U1 > L1 > Lesson 1 at QA stage', 16, 19, 20, 89, 3, 1, 'G1 > U1 > L1 > Lesson 1', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1904, 'G1 > U2 > L1 - QA', 'Task for G1 > U2 > L1 at QA stage', 16, 19, 20, 93, 9, NULL, 'G1 > U2 > L1', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1905, 'G1 > U1 > L2 - QA', 'Task for G1 > U1 > L2 at QA stage', 16, 19, 20, 89, 4, NULL, 'G1 > U1 > L2', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1906, 'G1 > U2 > L2 - QA', 'Task for G1 > U2 > L2 at QA stage', 16, 19, 20, 93, 10, NULL, 'G1 > U2 > L2', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1907, 'G1 > U1 > L3 - QA', 'Task for G1 > U1 > L3 at QA stage', 16, 19, 20, 89, 5, NULL, 'G1 > U1 > L3', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1908, 'G1 > U1 > L4 - QA', 'Task for G1 > U1 > L4 at QA stage', 16, 19, 20, 89, 6, NULL, 'G1 > U1 > L4', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1909, 'G1 > U1 > L5 - QA', 'Task for G1 > U1 > L5 at QA stage', 16, 19, 20, 89, 7, NULL, 'G1 > U1 > L5', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1910, 'G2 > L1 - QA', 'Task for G2 > L1 at QA stage', 16, 19, 21, 94, NULL, NULL, 'G2 > L1', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1911, 'G2 > L2 - QA', 'Task for G2 > L2 at QA stage', 16, 19, 21, 95, NULL, NULL, 'G2 > L2', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1912, 'G3 - QA', 'Task for G3 at QA stage', 16, 19, 22, NULL, NULL, NULL, 'G3', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1913, 'G4 - QA', 'Task for G4 at QA stage', 16, 19, 23, NULL, NULL, NULL, 'G4', 'not-started', 'medium', '2025-09-12', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-12 12:17:33', '2025-09-12 12:17:33'),
(1914, 'G4 > U3 > L2 > M1 - Stage 1', 'Task for G4 > U3 > L2 > M1 at Stage 1 stage', 18, 21, 28, 98, 12, 2, 'G4 > U3 > L2 > M1', 'not-started', 'medium', '2025-09-12', '2025-10-02', 0, 8.00, 0.00, 1, '2025-09-12 12:34:38', '2025-09-12 12:34:38'),
(1915, 'G3 > U2 > L1 - Stage 1', 'Task for G3 > U2 > L1 at Stage 1 stage', 18, 21, 27, 97, 11, NULL, 'G3 > U2 > L1', 'not-started', 'medium', '2025-09-12', '2025-10-02', 0, 8.00, 0.00, 1, '2025-09-12 12:34:38', '2025-09-12 12:34:38'),
(1916, 'G2 > U1 - Stage 1', 'Task for G2 > U1 at Stage 1 stage', 18, 21, 26, 96, NULL, NULL, 'G2 > U1', 'not-started', 'medium', '2025-09-12', '2025-10-02', 0, 8.00, 0.00, 1, '2025-09-12 13:16:43', '2025-09-12 13:16:43'),
(1917, 'G2 > U9 > asdadsasd > asdcbcx - Stage 1', 'Task for G2 > U9 > asdadsasd > asdcbcx at Stage 1 stage', 18, 21, 26, 100, 14, 3, 'G2 > U9 > asdadsasd > asdcbcx', 'not-started', 'medium', '2025-09-12', '2025-10-02', 0, 8.00, 0.00, 1, '2025-09-12 13:20:10', '2025-09-12 13:20:10'),
(1918, 'G2 > U8 > asd - Stage 1', 'Task for G2 > U8 > asd at Stage 1 stage', 18, 21, 26, 99, 13, NULL, 'G2 > U8 > asd', 'not-started', 'medium', '2025-09-12', '2025-10-02', 0, 8.00, 0.00, 1, '2025-09-12 13:20:10', '2025-09-12 13:20:10'),
(1919, 'G1 > U1 > L1 > Lesson 1 - Testing', 'Task for G1 > U1 > L1 > Lesson 1 at Testing stage', 16, 12, 20, 89, 3, 1, 'G1 > U1 > L1 > Lesson 1', 'not-started', 'medium', '2025-09-15', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-15 07:59:36', '2025-09-15 08:00:27'),
(1920, 'G2 > L1 - Testing', 'Task for G2 > L1 at Testing stage', 16, 12, 21, 94, NULL, NULL, 'G2 > L1', 'not-started', 'medium', '2025-09-15', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-15 07:59:36', '2025-09-15 07:59:36'),
(1921, 'G2 > L2 - Testing', 'Task for G2 > L2 at Testing stage', 16, 12, 21, 95, NULL, NULL, 'G2 > L2', 'not-started', 'medium', '2025-09-15', '2025-10-31', 0, 8.00, 0.00, 1, '2025-09-15 07:59:36', '2025-09-15 07:59:36'),
(1922, 'G3 - Testing', 'Task for G3 at Testing stage', 16, 12, 22, NULL, NULL, NULL, 'G3', 'not-started', 'medium', '2025-09-15', '2025-09-17', 0, 8.00, 0.00, 1, '2025-09-15 07:59:36', '2025-09-15 08:17:22');

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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`id`, `task_id`, `assignee_id`, `assignee_type`, `created_at`) VALUES
(10, 1853, 28, 'team', '2025-09-02 10:38:18'),
(11, 1861, 28, 'team', '2025-09-02 10:38:32'),
(13, 1829, 28, 'team', '2025-09-02 10:38:58'),
(34, 1895, 33, 'team', '2025-09-13 12:19:06'),
(36, 1893, 33, 'team', '2025-09-13 12:59:17'),
(38, 1845, 33, 'team', '2025-09-13 13:06:00'),
(39, 1892, 33, 'team', '2025-09-13 13:11:57'),
(40, 1821, 33, 'team', '2025-09-13 13:12:02'),
(41, 1818, 33, 'team', '2025-09-13 13:12:06'),
(42, 1822, 33, 'team', '2025-09-13 13:12:14'),
(43, 1837, 33, 'team', '2025-09-13 13:12:21'),
(44, 1820, 33, 'team', '2025-09-13 13:12:29'),
(45, 1922, 33, 'team', '2025-09-15 08:00:17'),
(46, 1919, 33, 'team', '2025-09-15 08:00:27');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track extension requests for tasks - allows team members to request deadline extensions';

--
-- Dumping data for table `task_extensions`
--

INSERT INTO `task_extensions` (`id`, `task_id`, `requested_by`, `requested_by_type`, `current_due_date`, `requested_due_date`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `review_notes`, `created_at`, `updated_at`) VALUES
(2, 1818, 33, 'team', '2025-08-27', '2025-09-19', 'test', 'rejected', 1, '2025-09-15 08:38:33', 'note', '2025-09-12 09:04:01', '2025-09-15 08:38:33'),
(3, 1822, 33, 'team', '2025-09-12', '2025-09-13', 'Reason test', 'approved', 1, '2025-09-12 11:06:16', 'Approved until 2025-09-12. Approved', '2025-09-12 11:05:53', '2025-09-12 11:06:16'),
(4, 1895, 33, 'team', '2025-09-13', '2025-09-14', 'afdsfdfssd', 'pending', NULL, NULL, NULL, '2025-09-13 13:00:18', '2025-09-13 13:00:18'),
(5, 1919, 33, 'team', '2025-10-31', '2025-09-16', 'reason', 'pending', NULL, NULL, NULL, '2025-09-15 08:06:58', '2025-09-15 08:06:58'),
(6, 1922, 33, 'team', '2025-09-20', '2025-09-16', 'accept', 'approved', 1, '2025-09-15 08:15:15', 'Approved until 2025-09-16. accepted', '2025-09-15 08:07:40', '2025-09-15 08:15:15'),
(7, 1892, 33, 'team', '2025-10-31', '2025-09-17', 'check', 'approved', 1, '2025-09-15 08:38:15', 'notes', '2025-09-15 08:16:13', '2025-09-15 08:38:15'),
(8, 1922, 33, 'team', '2025-09-16', '2025-09-17', 'chec', 'approved', 1, '2025-09-15 08:17:22', 'Approved until 2025-09-17. done', '2025-09-15 08:16:55', '2025-09-15 08:17:22');

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
  `remark_type` enum('general','complete','skipped','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `is_private` tinyint(1) DEFAULT '0' COMMENT 'Whether remark is private (only visible to admins)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `server_location` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Server path where files are saved',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Exact name of the file worked on',
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_added_by` (`added_by`,`added_by_type`),
  KEY `idx_remark_date` (`remark_date`),
  KEY `idx_remark_type` (`remark_type`),
  KEY `idx_private` (`is_private`),
  KEY `idx_task_remarks_task_date` (`task_id`,`remark_date`),
  KEY `idx_task_remarks_user` (`added_by`,`added_by_type`),
  KEY `idx_task_remarks_type` (`remark_type`,`is_private`),
  KEY `idx_server_location` (`server_location`),
  KEY `idx_file_name` (`file_name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Track remarks/comments on tasks - allows users to add notes and updates';

--
-- Dumping data for table `task_remarks`
--

INSERT INTO `task_remarks` (`id`, `task_id`, `added_by`, `added_by_type`, `remark_date`, `remark`, `remark_type`, `is_private`, `created_at`, `updated_at`, `server_location`, `file_name`) VALUES
(7, 1822, 33, 'team', '2025-09-12', '<p>jhsdj</p><p>kfshs</p><p><strong>sdjajs jhdjhs </strong> dhgsh <em>dfjhhs</em></p>', 'general', 0, '2025-09-12 11:42:21', '2025-09-12 11:42:21', NULL, NULL),
(8, 1822, 33, 'team', '2025-09-13', '<p>Please approve</p>', 'general', 0, '2025-09-13 10:59:06', '2025-09-13 10:59:06', NULL, NULL),
(9, 1895, 33, 'team', '2025-09-13', '<p>ABC</p>', '', 0, '2025-09-13 12:59:59', '2025-09-13 12:59:59', NULL, NULL),
(10, 1820, 33, 'team', '2025-09-15', '<p><strong>Status: </strong>working</p><p><strong>Server: </strong>workflow.bylinelms.com</p><p><strong>Remark:&nbsp;</strong></p><p>-Added the Approval system for the users so the users can request the completion, and admin can approve it from the Notifications, Tasks and Project Details - Changes not hosted yet</p><p>-Worked on connecting the wordpress to the moodle</p><p>-Tried hosting the internal applications to the new domain, but it is giving server issues, need to be resolved</p>', 'complete', 0, '2025-09-15 06:23:26', '2025-09-15 06:23:26', NULL, NULL),
(11, 1892, 33, 'team', '2025-09-15', '<p><strong>Status: </strong>working</p><p><strong>Server: </strong><a href=\"workflow.bylinelms.com\" rel=\"noopener noreferrer\" target=\"_blank\">workflow.bylinelms.com</a></p><p><strong>Remark:&nbsp;</strong></p><p>-Added the Approval system for the users so the users can request the completion, and admin can approve it from the Notifications, Tasks and Project Details - Changes not hosted yet</p><p>-Worked on connecting the wordpress to the moodle</p><p>-Tried hosting the internal applications to the new domain, but it is giving server issues, need to be resolved</p>', 'complete', 0, '2025-09-15 06:23:50', '2025-09-15 06:23:50', NULL, NULL),
(12, 1837, 33, 'team', '2025-09-15', '<p><strong>Status:</strong>working</p><p><strong>Server:</strong>workflow.bylinelms.com</p><p><strong>Remark:&nbsp;</strong></p><p>-Added the Approval system for the users so the users can request the completion, and admin can approve it from the Notifications, Tasks </p>', 'complete', 0, '2025-09-15 06:24:35', '2025-09-15 06:24:35', NULL, NULL),
(13, 1837, 33, 'team', '2025-09-15', '<p><strong>Status &lt;&lt;should be able to select&gt;&gt;</strong></p><p><em>In Progress / Completed / Skipped</em></p><p><strong>Server Location</strong><em>The exact path of the server where you have saved the file</em></p><p><strong>File Name</strong><em>The Exact name of the file you worked on</em></p><p><strong>Remark</strong><em>next steps, or any notes</em></p>', 'complete', 0, '2025-09-15 07:01:36', '2025-09-15 07:01:36', NULL, NULL),
(14, 1895, 33, 'team', '2025-09-15', '<p>Check</p>', 'complete', 0, '2025-09-15 07:02:45', '2025-09-15 07:02:45', NULL, NULL),
(15, 1837, 33, 'team', '2025-09-15', '<p>check</p>', 'complete', 0, '2025-09-15 07:02:56', '2025-09-15 07:02:56', NULL, NULL),
(16, 1892, 33, 'team', '2025-09-15', '<p>Check the file as this is completed</p>', 'complete', 0, '2025-09-15 07:11:41', '2025-09-15 07:11:41', 'Y:\\Tech\\Riyada Training UI UX\\Riyada Training UI UX_Folder', 'Riyada Training UI UX.ai'),
(17, 1821, 33, 'team', '2025-09-15', '<p>new test</p>', 'general', 0, '2025-09-15 07:19:48', '2025-09-15 07:19:48', 'Y:\\Tech\\Riyada Training UI UX\\Riyada Training UI UX_Folder', 'abc.pdf'),
(18, 1818, 33, 'team', '2025-09-15', '<p>fhks</p>', 'complete', 0, '2025-09-15 07:20:06', '2025-09-15 07:20:06', 'Y:\\Tech\\Riyada Training UI UX\\Riyada Training UI UX_Folder', 'check.pdf'),
(19, 1822, 33, 'team', '2025-09-15', '<p>safdd</p>', 'skipped', 0, '2025-09-15 07:24:26', '2025-09-15 07:24:26', 'Hello', 'check'),
(20, 1837, 33, 'team', '2025-09-15', '<p>fds</p>', 'skipped', 0, '2025-09-15 07:26:21', '2025-09-15 07:26:21', 'adas', 'adas'),
(21, 1821, 33, 'team', '2025-09-15', '<p>qwee2123</p>', 'skipped', 0, '2025-09-15 07:26:45', '2025-09-15 07:26:45', 'fdss', 'fssfbhdfgh'),
(22, 1818, 33, 'team', '2025-09-15', '<p>The task is completed </p><ol><li>One</li><li>Two</li><li>Three</li></ol>', 'complete', 0, '2025-09-15 07:39:22', '2025-09-15 07:39:22', 'Y:\\Standard ICT\\Digital Assets\\Grade 10\\Unit 2\\L2\\Published', 'ICT_G10_U1_L2');

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(5, 'Graphic Designers', '', NULL, NULL, 'team', 20, 1, '2025-08-14 21:35:49', '2025-08-18 12:51:39'),
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_allocations`
--

INSERT INTO `team_allocations` (`id`, `user_id`, `user_type`, `project_id`, `task_id`, `hours_per_day`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(41, 28, 'team', 16, 1853, 8.00, '2025-09-02', '2025-08-25', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(42, 28, 'team', 16, 1853, 8.00, '2025-09-02', '2025-08-25', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(43, 33, 'team', 16, 1837, 8.00, '2025-09-02', '2025-08-29', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(44, 33, 'team', 16, 1837, 8.00, '2025-09-02', '2025-08-29', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(45, 28, 'team', 16, 1861, 8.00, '2025-09-02', '2025-08-26', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(46, 28, 'team', 16, 1861, 8.00, '2025-09-02', '2025-08-26', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(49, 33, 'team', 16, 1818, 8.00, '2025-09-02', '2025-08-27', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(50, 33, 'team', 16, 1818, 8.00, '2025-09-02', '2025-08-27', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(51, 33, 'team', 16, 1820, 8.00, '2025-09-02', '2025-08-26', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(52, 33, 'team', 16, 1820, 8.00, '2025-09-02', '2025-08-26', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(53, 33, 'team', 16, 1821, 8.00, '2025-09-02', '2025-08-25', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(54, 33, 'team', 16, 1821, 8.00, '2025-09-02', '2025-08-25', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(55, 33, 'team', 16, 1822, 8.00, '2025-09-02', '2025-08-28', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(56, 33, 'team', 16, 1822, 8.00, '2025-09-02', '2025-08-28', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(59, 28, 'team', 16, 1829, 8.00, '2025-09-02', '2025-09-03', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(60, 28, 'team', 16, 1829, 8.00, '2025-09-02', '2025-09-03', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(61, 10, 'team', 16, 1845, 0.14, '2025-09-02', '2025-10-31', '2025-09-02 12:20:33', '2025-09-02 12:20:33'),
(62, 10, 'team', 16, 1845, 0.14, '2025-09-02', '2025-10-31', '2025-09-02 12:20:33', '2025-09-02 12:20:33');

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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(8, 'deleted_1755602990689_gxlmxx17gw@deleted.com', 'RAHUL123', 'Rahul Kirad', 0, '2025-08-18 12:42:28', '2025-08-11 16:51:14', '2025-08-19 11:29:50'),
(9, 'radha@bylinelearning.com', '2019', 'Radha', 1, NULL, '2025-08-14 21:30:23', '2025-08-14 21:30:23'),
(10, 'rohan@bylinelearning.com', '2019', 'Rohan', 1, NULL, '2025-08-14 21:31:07', '2025-08-14 21:31:07'),
(11, 'vinayak@bylinelearning.com', '2019', 'Vinayak', 1, NULL, '2025-08-14 21:31:34', '2025-08-14 21:31:34'),
(12, 'aniket@bylinelearning.com', '2019', 'Aniket', 1, NULL, '2025-08-14 21:32:07', '2025-08-14 21:32:07'),
(13, 'amol@bylinelearning.com', '2019', 'Amol', 1, '2025-09-03 10:44:31', '2025-08-14 21:32:24', '2025-09-03 10:44:31'),
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
(24, 'bhushan@bylinelearning.com', '2019', 'Bhushan', 1, NULL, '2025-08-14 22:39:38', '2025-08-18 10:49:24'),
(25, 'jitesh@bylinelearning.com', '2019', 'Jitesh', 1, NULL, '2025-08-14 22:39:59', '2025-08-14 22:40:07'),
(26, 'nikita@bylinelearning.com', '2019', 'Nikita', 1, NULL, '2025-08-14 22:40:31', '2025-08-14 22:40:31'),
(27, 'yash@bylinelearning.com', '2019', 'Yash', 1, NULL, '2025-08-14 22:40:54', '2025-08-14 22:40:54'),
(28, 'rahul.k@bylinelearning.com', '2019', 'Rahul', 1, NULL, '2025-08-19 11:30:17', '2025-08-19 11:30:17'),
(29, 'deleted_1755603889077_48dgx9u0u@deleted.com', 'FG', 'TEST', 0, NULL, '2025-08-19 11:44:39', '2025-08-19 11:44:49'),
(30, 'test@gmail.com', 'dftg', ' Test', 1, NULL, '2025-08-19 11:45:25', '2025-08-19 11:45:25'),
(33, 'zaki@bylinelearning.com', '2019', 'Zaki Shaikh', 1, '2025-09-13 12:51:12', '2025-09-02 10:00:24', '2025-09-13 12:51:12');

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
) ENGINE=MyISAM AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(41, 5, 7, 'member', '2025-08-18', 1, '2025-08-18 13:44:14', '2025-08-18 13:44:14'),
(42, 5, 8, 'member', '2025-08-18', 1, '2025-08-18 12:55:20', '2025-08-18 13:06:38'),
(43, 5, 20, 'member', '2025-08-18', 0, '2025-08-18 13:02:31', '2025-08-18 13:02:36'),
(44, 2, 28, 'member', '2025-08-19', 1, '2025-08-19 11:30:17', '2025-08-19 11:30:17'),
(45, 7, 30, 'member', '2025-08-19', 1, '2025-08-19 11:45:25', '2025-08-19 11:45:25'),
(46, 2, 33, 'member', '2025-09-02', 1, '2025-09-02 10:00:24', '2025-09-02 10:00:24');

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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_member_skills`
--

INSERT INTO `team_member_skills` (`id`, `team_member_id`, `skill_id`, `created_at`) VALUES
(5, 8, 6, '2025-08-11 16:51:14'),
(6, 8, 4, '2025-08-11 16:51:14'),
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
(46, 13, 3, '2025-08-15 05:14:24'),
(47, 28, 4, '2025-08-19 11:30:17'),
(48, 29, 9, '2025-08-19 11:44:39'),
(49, 30, 4, '2025-08-19 11:45:25'),
(50, 33, 6, '2025-09-02 10:00:24');

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `book_id`, `name`, `description`, `order_index`, `weight`, `created_at`, `updated_at`) VALUES
(3, 89, 'L1', 'L1', 1, 1.00, '2025-09-02 10:04:23', '2025-09-02 10:04:23'),
(4, 89, 'L2', 'L2', 2, 1.00, '2025-09-02 10:04:30', '2025-09-02 10:04:30'),
(5, 89, 'L3', 'L3', 3, 1.00, '2025-09-02 10:04:38', '2025-09-02 10:04:38'),
(6, 89, 'L4', 'L4', 4, 1.00, '2025-09-02 10:04:45', '2025-09-02 10:04:45'),
(7, 89, 'L5', 'L5', 5, 1.00, '2025-09-02 10:04:54', '2025-09-02 10:04:54'),
(9, 93, 'L1', 'L1', 1, 1.00, '2025-09-02 10:05:33', '2025-09-02 10:05:33'),
(10, 93, 'L2', 'L2', 2, 1.00, '2025-09-02 10:05:41', '2025-09-02 10:05:41'),
(11, 97, 'L1', NULL, 1, 0.00, '2025-09-12 12:33:39', '2025-09-12 12:33:39'),
(12, 98, 'L2', NULL, 1, 0.00, '2025-09-12 12:34:10', '2025-09-12 12:34:10'),
(13, 99, 'asd', NULL, 1, 0.00, '2025-09-12 13:18:58', '2025-09-12 13:18:58'),
(14, 100, 'asdadsasd', NULL, 1, 0.00, '2025-09-12 13:19:12', '2025-09-12 13:19:12');

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
  ADD CONSTRAINT `fk_performance_flags_added_by` FOREIGN KEY (`added_by_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_performance_flags_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
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
