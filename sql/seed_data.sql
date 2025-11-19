-- ============================================================================
-- BUBT Hackathon - Sample Data Seeding Script
-- ============================================================================
-- File: sql/seed_data.sql
-- Purpose: Populate initial data (food items, resources, test user, sample inventory)
-- Run after: core_schema.sql
-- ============================================================================

USE `bubt_hackathon_db`;

-- ============================================================================
-- Insert Food Items (Master Catalog)
-- ============================================================================
INSERT INTO `food_items` (`name`, `category`, `default_expiration_days`, `average_cost`, `unit`, `created_at`)
VALUES
  ('Milk', 'Dairy', 7, 3.50, 'liter', NOW()),
  ('Rice', 'Grains', 365, 2.00, 'kg', NOW()),
  ('Eggs', 'Protein', 21, 4.50, 'dozen', NOW()),
  ('Spinach', 'Vegetables', 5, 1.50, 'bunch', NOW()),
  ('Apples', 'Fruits', 14, 0.80, 'piece', NOW()),
  ('Bread', 'Grains', 3, 2.50, 'loaf', NOW()),
  ('Chicken Breast', 'Protein', 2, 8.00, 'kg', NOW()),
  ('Tomato', 'Vegetables', 7, 1.20, 'piece', NOW())
ON DUPLICATE KEY UPDATE 
  `category` = VALUES(`category`),
  `default_expiration_days` = VALUES(`default_expiration_days`);

-- ============================================================================
-- Insert Resources (Educational Content)
-- ============================================================================
INSERT INTO `resources` (`title`, `content`, `category_tag`, `resource_type`, `created_at`)
VALUES
  (
    'How to Store Vegetables Properly',
    'Keep leafy greens in a plastic bag in the refrigerator to maintain moisture. Store root vegetables in a cool, dark place. Tomatoes should NOT be refrigerated.',
    'Storage Tips',
    'TIP',
    NOW()
  ),
  (
    'Understanding Expiration Dates',
    'Learn the difference between "best by," "sell by," and "use by" dates. Most food is safe well beyond these dates when stored properly.',
    'Food Safety',
    'ARTICLE',
    NOW()
  ),
  (
    'Creative Ways to Use Leftover Vegetables',
    'From smoothies to soup stock, discover 10 delicious ways to repurpose vegetables that are about to expire.',
    'Recipe Ideas',
    'VIDEO',
    NOW()
  ),
  (
    'Meal Planning to Reduce Waste',
    'Plan your meals based on what you already have. Use the First-In-First-Out (FIFO) method to prioritize older items.',
    'Meal Planning',
    'ARTICLE',
    NOW()
  ),
  (
    'Freezing Guide for Common Foods',
    'Did you know you can freeze most vegetables, meats, and even bread? Learn which foods freeze best and for how long.',
    'Food Preservation',
    'TIP',
    NOW()
  ),
  (
    'Composting at Home',
    'Turn your food scraps into nutrient-rich compost for your garden. No yard? Try vermicomposting (worm bins)!',
    'Sustainability',
    'ARTICLE',
    NOW()
  )
ON DUPLICATE KEY UPDATE 
  `content` = VALUES(`content`),
  `category_tag` = VALUES(`category_tag`);

-- ============================================================================
-- Insert Test User
-- ============================================================================
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `household_size`, `dietary_preferences`, `location`, `created_at`)
VALUES
  (
    'vegetarian.user@example.com',
    'hashed_password_example_do_not_use_in_production',
    'Test User',
    4,
    JSON_ARRAY('Vegetarian', 'Gluten-Free'),
    'Dhaka, Bangladesh',
    NOW()
  )
ON DUPLICATE KEY UPDATE 
  `full_name` = VALUES(`full_name`),
  `household_size` = VALUES(`household_size`);

-- ============================================================================
-- Insert Sample Inventory Items
-- ============================================================================
SET @test_user_id = (SELECT `id` FROM `users` WHERE `email` = 'vegetarian.user@example.com' LIMIT 1);
SET @milk_id = (SELECT `id` FROM `food_items` WHERE `name` = 'Milk' LIMIT 1);
SET @spinach_id = (SELECT `id` FROM `food_items` WHERE `name` = 'Spinach' LIMIT 1);
SET @bread_id = (SELECT `id` FROM `food_items` WHERE `name` = 'Bread' LIMIT 1);
SET @apples_id = (SELECT `id` FROM `food_items` WHERE `name` = 'Apples' LIMIT 1);

INSERT INTO `inventory` 
  (`user_id`, `food_item_id`, `custom_name`, `quantity`, `unit`, `purchase_date`, `expiration_date`, `created_at`)
VALUES
  (
    @test_user_id,
    @milk_id,
    'Full Cream Milk',
    2.00,
    'liter',
    CURDATE() - INTERVAL 2 DAY,
    CURDATE() + INTERVAL 5 DAY,
    NOW()
  ),
  (
    @test_user_id,
    @spinach_id,
    'Fresh Spinach Bunch',
    1.00,
    'bunch',
    CURDATE() - INTERVAL 1 DAY,
    CURDATE() + INTERVAL 4 DAY,
    NOW()
  ),
  (
    @test_user_id,
    @bread_id,
    'Whole Wheat Bread',
    1.00,
    'loaf',
    CURDATE(),
    CURDATE() + INTERVAL 2 DAY,
    NOW()
  ),
  (
    @test_user_id,
    @apples_id,
    'Red Apples',
    5.00,
    'piece',
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() + INTERVAL 9 DAY,
    NOW()
  );

-- ============================================================================
-- Insert Sample Consumption Logs
-- ============================================================================
INSERT INTO `consumption_logs` 
  (`user_id`, `food_name`, `action_type`, `quantity`, `reason_for_waste`, `log_date`)
VALUES
  (
    @test_user_id,
    'Spinach',
    'PURCHASED',
    1.00,
    NULL,
    NOW() - INTERVAL 1 DAY
  ),
  (
    @test_user_id,
    'Milk',
    'PURCHASED',
    2.00,
    NULL,
    NOW() - INTERVAL 2 DAY
  ),
  (
    @test_user_id,
    'Spinach',
    'CONSUMED',
    0.50,
    NULL,
    NOW() - INTERVAL 1 DAY
  ),
  (
    @test_user_id,
    'Apples',
    'WASTED',
    1.00,
    'Got bruised, not edible',
    NOW() - INTERVAL 3 DAY
  ),
  (
    @test_user_id,
    'Bread',
    'PURCHASED',
    1.00,
    NULL,
    NOW()
  );

-- ============================================================================
-- Verification Queries
-- ============================================================================
SELECT '===== SEED DATA INSERTED SUCCESSFULLY =====' AS status;

SELECT COUNT(*) AS total_food_items FROM `food_items`;
SELECT COUNT(*) AS total_resources FROM `resources`;
SELECT COUNT(*) AS total_users FROM `users`;
SELECT COUNT(*) AS total_inventory_items FROM `inventory`;
SELECT COUNT(*) AS total_consumption_logs FROM `consumption_logs`;

SELECT '===== Sample User Data =====' AS section;
SELECT `id`, `email`, `full_name`, `household_size`, `dietary_preferences` FROM `users` LIMIT 1;

SELECT '===== Expiring Items (Next 7 Days) =====' AS section;
SELECT * FROM `expiring_inventory` LIMIT 10;

SELECT '===== User Consumption Summary =====' AS section;
SELECT * FROM `user_consumption_summary`;

-- ============================================================================
-- End of seed data script
-- ============================================================================
