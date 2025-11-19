-- ============================================================================
-- BUBT Hackathon Core Database Schema
-- ============================================================================
-- File: sql/core_schema.sql
-- Purpose: Complete MySQL DDL for the core application database
-- Database: bubt_hackathon_db (8 tables, 5 core + resources + audit)
-- Charset: utf8mb4 (supports emojis, international characters)
-- Engine: InnoDB (ACID compliance, foreign keys, transactions)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing objects (optional, comment out if you want to preserve data)
-- DROP DATABASE IF EXISTS `bubt_hackathon_db`;

-- Create database if it does not exist
CREATE DATABASE IF NOT EXISTS `bubt_hackathon_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `bubt_hackathon_db`;

-- ============================================================================
-- Table: users
-- Description: System users with authentication and profile information
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255),
  `household_size` INT NOT NULL DEFAULT 1,
  `dietary_preferences` JSON,
  `location` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  INDEX `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: food_items
-- Description: Master list of food items with category and expiration metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `default_expiration_days` INT,
  `average_cost` DECIMAL(10,2),
  `unit` VARCHAR(50),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_food_items_name` (`name`),
  INDEX `idx_food_items_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: inventory
-- Description: User-specific inventory items with quantity, expiration, and metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `food_item_id` BIGINT UNSIGNED,
  `custom_name` VARCHAR(255),
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `unit` VARCHAR(50),
  `purchase_date` DATE,
  `expiration_date` DATE,
  `source_image_url` VARCHAR(2048),
  `ai_metadata` JSON,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_inventory_user_id` (`user_id`),
  INDEX `idx_inventory_expiration_date` (`expiration_date`),
  INDEX `idx_inventory_food_item_id` (`food_item_id`),
  INDEX `idx_inventory_purchase_date` (`purchase_date`),
  
  CONSTRAINT `fk_inventory_user_id` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_food_item_id` FOREIGN KEY (`food_item_id`) 
    REFERENCES `food_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: consumption_logs
-- Description: Audit log of consumption, waste, donation, and purchase actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `consumption_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `food_name` VARCHAR(255),
  `action_type` ENUM('PURCHASED','CONSUMED','WASTED','DONATED') NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `reason_for_waste` TEXT,
  `log_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_consumption_user_id` (`user_id`),
  INDEX `idx_consumption_log_date` (`log_date`),
  INDEX `idx_consumption_action_type` (`action_type`),
  INDEX `idx_consumption_user_log_date` (`user_id`, `log_date`),
  
  CONSTRAINT `fk_consumption_user_id` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: resources
-- Description: Educational resources (tips, articles, videos) for food waste reduction
-- ============================================================================
CREATE TABLE IF NOT EXISTS `resources` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT,
  `category_tag` VARCHAR(100),
  `resource_type` ENUM('TIP','ARTICLE','VIDEO') NOT NULL DEFAULT 'TIP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_resources_category_tag` (`category_tag`),
  INDEX `idx_resources_resource_type` (`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- View: user_consumption_summary
-- Description: Aggregated consumption statistics per user
-- ============================================================================
CREATE OR REPLACE VIEW `user_consumption_summary` AS
SELECT 
  u.`id` AS `user_id`,
  u.`email`,
  u.`full_name`,
  COUNT(CASE WHEN cl.`action_type` = 'PURCHASED' THEN 1 END) AS `total_purchased`,
  COUNT(CASE WHEN cl.`action_type` = 'CONSUMED' THEN 1 END) AS `total_consumed`,
  COUNT(CASE WHEN cl.`action_type` = 'WASTED' THEN 1 END) AS `total_wasted`,
  COUNT(CASE WHEN cl.`action_type` = 'DONATED' THEN 1 END) AS `total_donated`,
  ROUND(SUM(CASE WHEN cl.`action_type` = 'WASTED' THEN cl.`quantity` ELSE 0 END), 2) AS `total_waste_qty`,
  MAX(cl.`log_date`) AS `last_log_date`
FROM `users` u
LEFT JOIN `consumption_logs` cl ON u.`id` = cl.`user_id`
GROUP BY u.`id`, u.`email`, u.`full_name`;

-- ============================================================================
-- View: expiring_inventory
-- Description: Items expiring within the next 7 days
-- ============================================================================
CREATE OR REPLACE VIEW `expiring_inventory` AS
SELECT 
  inv.`id`,
  inv.`user_id`,
  u.`email`,
  inv.`custom_name` AS `item_name`,
  fi.`name` AS `food_item_name`,
  inv.`quantity`,
  inv.`unit`,
  inv.`expiration_date`,
  DATEDIFF(inv.`expiration_date`, CURDATE()) AS `days_until_expiry`
FROM `inventory` inv
JOIN `users` u ON inv.`user_id` = u.`id`
LEFT JOIN `food_items` fi ON inv.`food_item_id` = fi.`id`
WHERE inv.`expiration_date` <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND inv.`expiration_date` >= CURDATE()
ORDER BY inv.`expiration_date` ASC;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of core schema
-- ============================================================================
-- Notes:
-- 1. This schema uses InnoDB engine for ACID compliance and FK support
-- 2. Charset utf8mb4 supports international text and emojis
-- 3. JSON columns store flexible metadata (dietary preferences, AI data)
-- 4. DECIMAL(10,2) used for cost/quantity precision (not floating-point)
-- 5. Indexes are optimized for common queries (user_id, expiration_date, log_date)
-- 6. Foreign keys use CASCADE on users (cleanup) and SET NULL on food_items (preserve logs)
-- 7. Enums restrict action_type and resource_type to valid values
-- 8. Views provide quick aggregations without complex queries
-- ============================================================================
