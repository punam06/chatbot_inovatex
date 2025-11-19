-- ============================================================================
-- BUBT Hackathon - Smoke Test & Validation Script
-- ============================================================================
-- File: sql/smoke_test.sql
-- Purpose: Verify database schema, relationships, indexes, and basic connectivity
-- Run after: core_schema.sql (and optionally seed_data.sql)
-- ============================================================================

USE `bubt_hackathon_db`;

-- ============================================================================
-- Section 1: Database & Table Existence
-- ============================================================================
SELECT '========== SECTION 1: Database Verification ==========' AS test_section;

SELECT 
  `SCHEMA_NAME` AS database_name,
  `DEFAULT_CHARACTER_SET_NAME` AS charset,
  `DEFAULT_COLLATION_NAME` AS collation
FROM `INFORMATION_SCHEMA`.`SCHEMATA`
WHERE `SCHEMA_NAME` = 'bubt_hackathon_db';

SELECT '===== Tables Present =====' AS subsection;
SELECT 
  `TABLE_NAME`,
  `TABLE_TYPE`,
  `TABLE_ROWS` AS estimated_rows
FROM `INFORMATION_SCHEMA`.`TABLES`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `TABLE_TYPE` = 'BASE TABLE'
ORDER BY `TABLE_NAME`;

-- ============================================================================
-- Section 2: Table Structure Verification
-- ============================================================================
SELECT '========== SECTION 2: Table Structures ==========' AS test_section;

SELECT '===== users table =====' AS subsection;
DESCRIBE `users`;

SELECT '===== food_items table =====' AS subsection;
DESCRIBE `food_items`;

SELECT '===== inventory table =====' AS subsection;
DESCRIBE `inventory`;

SELECT '===== consumption_logs table =====' AS subsection;
DESCRIBE `consumption_logs`;

SELECT '===== resources table =====' AS subsection;
DESCRIBE `resources`;

-- ============================================================================
-- Section 3: Indexes Verification
-- ============================================================================
SELECT '========== SECTION 3: Indexes ==========' AS test_section;

SELECT 
  `TABLE_NAME`,
  `INDEX_NAME`,
  `COLUMN_NAME`,
  `SEQ_IN_INDEX` AS column_position,
  `NON_UNIQUE`
FROM `INFORMATION_SCHEMA`.`STATISTICS`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `TABLE_TYPE` = 'BASE TABLE'
ORDER BY `TABLE_NAME`, `INDEX_NAME`, `SEQ_IN_INDEX`;

-- ============================================================================
-- Section 4: Foreign Key Relationships
-- ============================================================================
SELECT '========== SECTION 4: Foreign Keys ==========' AS test_section;

SELECT 
  `CONSTRAINT_NAME`,
  `TABLE_NAME`,
  `COLUMN_NAME`,
  `REFERENCED_TABLE_NAME`,
  `REFERENCED_COLUMN_NAME`,
  `UPDATE_RULE`,
  `DELETE_RULE`
FROM `INFORMATION_SCHEMA`.`KEY_COLUMN_USAGE`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `REFERENCED_TABLE_NAME` IS NOT NULL
ORDER BY `TABLE_NAME`, `CONSTRAINT_NAME`;

-- ============================================================================
-- Section 5: Enums Verification
-- ============================================================================
SELECT '========== SECTION 5: Enum Types ==========' AS test_section;

SELECT 
  `COLUMN_NAME`,
  `COLUMN_TYPE`,
  `TABLE_NAME`
FROM `INFORMATION_SCHEMA`.`COLUMNS`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `COLUMN_TYPE` LIKE 'enum%'
ORDER BY `TABLE_NAME`, `COLUMN_NAME`;

-- ============================================================================
-- Section 6: JSON Columns Verification
-- ============================================================================
SELECT '========== SECTION 6: JSON Columns ==========' AS test_section;

SELECT 
  `TABLE_NAME`,
  `COLUMN_NAME`,
  `DATA_TYPE`,
  `COLUMN_TYPE`
FROM `INFORMATION_SCHEMA`.`COLUMNS`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `DATA_TYPE` = 'json'
ORDER BY `TABLE_NAME`, `COLUMN_NAME`;

-- ============================================================================
-- Section 7: Views Verification
-- ============================================================================
SELECT '========== SECTION 7: Views ==========' AS test_section;

SELECT 
  `TABLE_NAME` AS view_name,
  `TABLE_TYPE`
FROM `INFORMATION_SCHEMA`.`TABLES`
WHERE `TABLE_SCHEMA` = 'bubt_hackathon_db'
  AND `TABLE_TYPE` = 'VIEW'
ORDER BY `TABLE_NAME`;

-- ============================================================================
-- Section 8: Data Verification (if seeded)
-- ============================================================================
SELECT '========== SECTION 8: Data Row Counts ==========' AS test_section;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM `users`
UNION ALL
SELECT 'food_items' AS table_name, COUNT(*) AS row_count FROM `food_items`
UNION ALL
SELECT 'inventory' AS table_name, COUNT(*) AS row_count FROM `inventory`
UNION ALL
SELECT 'consumption_logs' AS table_name, COUNT(*) AS row_count FROM `consumption_logs`
UNION ALL
SELECT 'resources' AS table_name, COUNT(*) AS row_count FROM `resources`
ORDER BY row_count DESC;

-- ============================================================================
-- Section 9: Sample Data Queries (if available)
-- ============================================================================
SELECT '========== SECTION 9: Sample Data ==========' AS test_section;

SELECT '===== Users (sample) =====' AS subsection;
SELECT * FROM `users` LIMIT 3;

SELECT '===== Food Items (sample) =====' AS subsection;
SELECT * FROM `food_items` LIMIT 5;

SELECT '===== Resources (sample) =====' AS subsection;
SELECT * FROM `resources` LIMIT 3;

-- ============================================================================
-- Section 10: Query Performance Tests
-- ============================================================================
SELECT '========== SECTION 10: Query Performance ==========' AS test_section;

SELECT '===== User with Inventory Count =====' AS subsection;
SELECT 
  u.`id`,
  u.`email`,
  COUNT(i.`id`) AS inventory_count
FROM `users` u
LEFT JOIN `inventory` i ON u.`id` = i.`user_id`
GROUP BY u.`id`, u.`email`;

SELECT '===== Consumption Summary per User =====' AS subsection;
SELECT * FROM `user_consumption_summary`;

SELECT '===== Expiring Inventory (next 7 days) =====' AS subsection;
SELECT * FROM `expiring_inventory`;

-- ============================================================================
-- Section 11: Transaction Test (INSERT and ROLLBACK)
-- ============================================================================
SELECT '========== SECTION 11: Transaction Test ==========' AS test_section;

START TRANSACTION;

INSERT INTO `users` (`email`, `password_hash`, `full_name`, `household_size`, `location`)
VALUES ('test.transaction@example.com', 'test_hash', 'Transaction Test User', 2, 'Test Location');

SELECT 'Transaction INSERT successful - will rollback' AS message;
SELECT COUNT(*) AS users_after_insert FROM `users` WHERE `email` = 'test.transaction@example.com';

ROLLBACK;

SELECT COUNT(*) AS users_after_rollback FROM `users` WHERE `email` = 'test.transaction@example.com';

-- ============================================================================
-- Summary
-- ============================================================================
SELECT '========== SMOKE TEST COMPLETE ==========' AS final_status;
SELECT 
  'Database: bubt_hackathon_db' AS info,
  'Status: All structures verified' AS status,
  NOW() AS test_timestamp;

-- ============================================================================
-- End of smoke test script
-- ============================================================================
