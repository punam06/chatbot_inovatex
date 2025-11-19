# 📊 Data Inventory & Structure Reference

**Document Date**: November 2025  
**Version**: 1.0  
**Purpose**: Complete reference for all data structures, sample data, and relationships for feature implementation

---

## 🎯 Executive Summary

This document provides a complete inventory of:
- All database tables and their fields
- Sample data currently in the database
- Data relationships and constraints
- Enum types and validation rules
- Data types and field constraints
- Pre-loaded master data

Use this as a **single source of truth** when implementing new features to ensure consistency with existing data structures.

---

## 📑 Table of Contents

1. [Database Overview](#database-overview)
2. [Table Specifications](#table-specifications)
3. [Sample Data Inventory](#sample-data-inventory)
4. [Relationships Map](#relationships-map)
5. [Enums & Validation](#enums--validation)
6. [Data Type Reference](#data-type-reference)
7. [Constraints & Rules](#constraints--rules)
8. [Views & Aggregations](#views--aggregations)
9. [Implementation Checklist](#implementation-checklist)

---

## 📚 Database Overview

**Database Name**: `bubt_hackathon_db`  
**Character Set**: `utf8mb4` (supports international text, emojis)  
**Collation**: `utf8mb4_unicode_ci` (case-insensitive)  
**Engine**: InnoDB (ACID compliant, transactions supported)  
**Total Tables**: 5 core tables  
**Total Views**: 2 views  
**Total Indexes**: 10+ performance indexes  

**Connection String Template**:
```
mysql://username:password@localhost:3306/bubt_hackathon_db
```

---

## 🗄️ Table Specifications

### 1️⃣ USERS Table

**Purpose**: Store user authentication and profile information

**Table Name**: `users`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Must be unique per user |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed with bcrypt in production |
| `full_name` | VARCHAR(255) | NULLABLE | User's display name |
| `household_size` | INT | NOT NULL, DEFAULT=1 | Number of people in household |
| `dietary_preferences` | JSON | NULLABLE | Array of preferences (see enum section) |
| `location` | VARCHAR(255) | NULLABLE | User's address/city |
| `created_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Account creation timestamp |
| `updated_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Last modification timestamp |

**Indexes**:
- `uk_users_email` (UNIQUE) — Fast login by email
- `idx_users_created_at` — For user analytics by date

**Example Record** (from seed data):
```json
{
  "id": 1,
  "email": "vegetarian.user@example.com",
  "password_hash": "hashed_password_example_do_not_use_in_production",
  "full_name": "Test User",
  "household_size": 4,
  "dietary_preferences": ["Vegetarian", "Gluten-Free"],
  "location": "Dhaka, Bangladesh",
  "created_at": "2025-11-19 10:00:00",
  "updated_at": "2025-11-19 10:00:00"
}
```

**Sample Data Count**: 1 test user

**Usage in Features**:
- User registration & login
- User profile management
- Household settings
- Dietary restriction filtering
- Location-based features

---

### 2️⃣ FOOD_ITEMS Table

**Purpose**: Master catalog of food items with standard expiration and cost data

**Table Name**: `food_items`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique food identifier |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Standardized food name |
| `category` | VARCHAR(100) | NULLABLE | Food category |
| `default_expiration_days` | INT | NULLABLE | Standard shelf life (days) |
| `average_cost` | DECIMAL(10,2) | NULLABLE | Typical cost per unit |
| `unit` | VARCHAR(50) | NULLABLE | Measurement unit |
| `created_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Record creation |
| `updated_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Last update |

**Indexes**:
- `uk_food_items_name` (UNIQUE) — Fast lookup by name
- `idx_food_items_category` — Fast category filtering

**Pre-loaded Sample Data** (8 items):

| ID | Name | Category | Default Expiration Days | Avg Cost | Unit |
|----|------|----------|------------------------|----------|------|
| 1 | Milk | Dairy | 7 | 3.50 | liter |
| 2 | Rice | Grains | 365 | 2.00 | kg |
| 3 | Eggs | Protein | 21 | 4.50 | dozen |
| 4 | Spinach | Vegetables | 5 | 1.50 | bunch |
| 5 | Apples | Fruits | 14 | 0.80 | piece |
| 6 | Bread | Grains | 3 | 2.50 | loaf |
| 7 | Chicken Breast | Protein | 2 | 8.00 | kg |
| 8 | Tomato | Vegetables | 7 | 1.20 | piece |

**Sample Data Count**: 8 items (expandable)

**Categories Included**:
- Dairy
- Grains
- Vegetables
- Fruits
- Protein

**Units Used**:
- kg (kilograms)
- liter (liquid volume)
- piece/unit (individual items)
- dozen (12 items)
- bunch (grouped vegetables)
- loaf (bread)

**Usage in Features**:
- Inventory management (linking to standard items)
- Shopping suggestions
- Cost estimation
- Expiration alerts (based on purchase + default days)
- Recipe recommendations

---

### 3️⃣ INVENTORY Table

**Purpose**: Track user's personal food items with quantities, purchase dates, and AI metadata

**Table Name**: `inventory`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique inventory record |
| `user_id` | BIGINT UNSIGNED | FK→users (CASCADE), NOT NULL | Link to owner |
| `food_item_id` | BIGINT UNSIGNED | FK→food_items (SET NULL) | Link to master food item |
| `custom_name` | VARCHAR(255) | NULLABLE | User's custom name (e.g., "Organic Whole Milk") |
| `quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT=0 | Current quantity |
| `unit` | VARCHAR(50) | NULLABLE | Unit of measurement |
| `purchase_date` | DATE | NULLABLE | When purchased |
| `expiration_date` | DATE | NULLABLE | When expires |
| `source_image_url` | VARCHAR(2048) | NULLABLE | URL to receipt/product image |
| `ai_metadata` | JSON | NULLABLE | AI-extracted data (brand, ripeness, quality) |
| `created_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Record creation |
| `updated_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Last update |

**Indexes**:
- `idx_inventory_user_id` — Fast user inventory lookup
- `idx_inventory_expiration_date` — **CRITICAL** for expiry alerts
- `idx_inventory_food_item_id` — Fast food item lookups
- `idx_inventory_purchase_date` — For purchase history queries

**Example Record** (from seed data):
```json
{
  "id": 1,
  "user_id": 1,
  "food_item_id": 1,
  "custom_name": "Full Cream Milk",
  "quantity": 2.00,
  "unit": "liter",
  "purchase_date": "2025-11-17",
  "expiration_date": "2025-11-24",
  "source_image_url": null,
  "ai_metadata": null,
  "created_at": "2025-11-19 10:00:00",
  "updated_at": "2025-11-19 10:00:00"
}
```

**Sample Data Count**: 4 items (for test user)

**Pre-loaded Items**:
1. Full Cream Milk (2 liters) — expires in 5 days
2. Fresh Spinach Bunch (1 bunch) — expires in 4 days
3. Whole Wheat Bread (1 loaf) — expires in 2 days
4. Red Apples (5 pieces) — expires in 9 days

**JSON Structure** (ai_metadata example):
```json
{
  "brand": "Organic Brand Name",
  "ripeness_score": 0.85,
  "quality_rating": 4.5,
  "detected_allergens": ["nuts"],
  "storage_location": "refrigerator",
  "condition": "fresh"
}
```

**Usage in Features**:
- Dashboard display (what user has)
- Inventory management (add/edit/delete)
- Expiration tracking (alerts)
- Image-based food recognition (CV/AI)
- Quantity tracking
- Cost estimation
- Shopping lists

---

### 4️⃣ CONSUMPTION_LOGS Table

**Purpose**: Audit trail of all food-related actions (purchases, consumption, waste, donation) — serves as training data for waste prediction

**Table Name**: `consumption_logs`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique log entry |
| `user_id` | BIGINT UNSIGNED | FK→users (CASCADE), NOT NULL | Which user |
| `food_name` | VARCHAR(255) | NULLABLE | Snapshot of food name at time of action |
| `action_type` | ENUM | NOT NULL | Type of action (see enum section) |
| `quantity` | DECIMAL(10,2) | NOT NULL, DEFAULT=0 | Amount involved |
| `reason_for_waste` | TEXT | NULLABLE | Why was it wasted? (e.g., "Got bruised") |
| `log_date` | DATETIME | NOT NULL, DEFAULT=NOW() | When action occurred |

**Indexes**:
- `idx_consumption_user_id` — Fast user history lookup
- `idx_consumption_log_date` — Fast date-range queries
- `idx_consumption_action_type` — Fast filtering by action type
- `idx_consumption_user_log_date` (composite) — **CRITICAL** for analytics

**Enum Values** (action_type):
- `PURCHASED` — Item was bought
- `CONSUMED` — Item was eaten/used
- `WASTED` — Item was thrown away (reason optional)
- `DONATED` — Item was given to someone else

**Sample Data** (5 entries for test user):

| ID | User | Food Name | Action Type | Quantity | Reason | Log Date |
|----|------|-----------|-------------|----------|--------|----------|
| 1 | 1 | Spinach | PURCHASED | 1.00 | - | 2025-11-18 10:00 |
| 2 | 1 | Milk | PURCHASED | 2.00 | - | 2025-11-17 09:30 |
| 3 | 1 | Spinach | CONSUMED | 0.50 | - | 2025-11-18 11:00 |
| 4 | 1 | Apples | WASTED | 1.00 | Got bruised, not edible | 2025-11-16 15:00 |
| 5 | 1 | Bread | PURCHASED | 1.00 | - | 2025-11-19 08:00 |

**Sample Data Count**: 5 entries (expandable)

**Usage in Features**:
- User consumption analytics
- Waste reduction insights
- AI training data (predict waste patterns)
- User statistics dashboard
- Household consumption trends
- Sustainability reports
- Behavioral nudges (show waste patterns)

---

### 5️⃣ RESOURCES Table

**Purpose**: Educational content (tips, articles, videos) for food waste reduction

**Table Name**: `resources`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique resource |
| `title` | VARCHAR(255) | NOT NULL | Resource title |
| `content` | LONGTEXT | NULLABLE | Full content (markdown supported) |
| `category_tag` | VARCHAR(100) | NULLABLE | Topic category |
| `resource_type` | ENUM | NOT NULL, DEFAULT='TIP' | Type of resource |
| `created_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Created date |
| `updated_at` | DATETIME | NOT NULL, DEFAULT=NOW() | Last update |

**Indexes**:
- `idx_resources_category_tag` — Fast category filtering
- `idx_resources_resource_type` — Fast type filtering

**Enum Values** (resource_type):
- `TIP` — Quick actionable tip
- `ARTICLE` — Long-form article
- `VIDEO` — Video tutorial

**Pre-loaded Sample Data** (6 resources):

| ID | Title | Type | Category | Content Preview |
|----|-------|------|----------|-----------------|
| 1 | How to Store Vegetables Properly | TIP | Storage Tips | Keep leafy greens in plastic bag... |
| 2 | Understanding Expiration Dates | ARTICLE | Food Safety | Learn the difference between "best by"... |
| 3 | Creative Ways to Use Leftover Vegetables | VIDEO | Recipe Ideas | From smoothies to soup stock... |
| 4 | Meal Planning to Reduce Waste | ARTICLE | Meal Planning | Plan meals based on what you have... |
| 5 | Freezing Guide for Common Foods | TIP | Food Preservation | Did you know you can freeze most vegetables... |
| 6 | Composting at Home | ARTICLE | Sustainability | Turn your food scraps into compost... |

**Sample Data Count**: 6 resources (expandable)

**Categories Included**:
- Storage Tips
- Food Safety
- Recipe Ideas
- Meal Planning
- Food Preservation
- Sustainability

**Usage in Features**:
- Educational feed/carousel
- Contextual tips (e.g., "Your apples expiring soon? Check this recipe")
- User learning/onboarding
- Sustainability features
- In-app notifications with tips

---

## 🔗 Relationships Map

### Foreign Key Relationships

```
users (1)
  │
  ├──→ (N) inventory
  │         ├─→ (?) food_items (SetNull if deleted)
  │         └─→ [JSON] aiMetadata
  │
  └──→ (N) consumption_logs
          └─→ [ENUM] action_type

food_items (1)
  └──→ (N) inventory

resources (standalone)
  └─→ [ENUM] resource_type
```

### Cascade Rules

| From | To | Action | Behavior |
|------|-----|--------|----------|
| users | inventory | DELETE | CASCADE (delete all user's items) |
| users | consumption_logs | DELETE | CASCADE (delete all user's logs) |
| food_items | inventory | DELETE | SET NULL (preserve item history) |

### Relationship Details

**users → inventory** (1:N)
- **Type**: One user has many inventory items
- **Constraint**: ON DELETE CASCADE
- **When to use**: Join when listing user's food items
- **Query pattern**: `SELECT * FROM inventory WHERE user_id = ?`

**users → consumption_logs** (1:N)
- **Type**: One user has many log entries
- **Constraint**: ON DELETE CASCADE
- **When to use**: Join when fetching user's consumption history
- **Query pattern**: `SELECT * FROM consumption_logs WHERE user_id = ? ORDER BY log_date DESC`

**food_items → inventory** (1:N)
- **Type**: One food item can be in many user inventories
- **Constraint**: ON DELETE SET NULL
- **When to use**: Join to get food item details (name, expiration days, etc.)
- **Query pattern**: `SELECT i.*, f.* FROM inventory i LEFT JOIN food_items f ON i.food_item_id = f.id`

**No direct link**: resources are standalone (not linked to inventory or consumption logs)

---

## 📋 Enums & Validation

### ActionType Enum (consumption_logs.action_type)

**4 Valid Values**:

| Value | Meaning | Use Case | reason_for_waste | Notes |
|-------|---------|----------|------------------|-------|
| PURCHASED | Item was bought | New inventory | Not applicable | Marks entry into system |
| CONSUMED | Item was eaten/used | Tracking usage | Not applicable | Normal consumption |
| WASTED | Item was discarded | Loss tracking | Required/Recommended | Important for analytics |
| DONATED | Item was given away | Altruism tracking | Optional | Alternative to waste |

**SQL Validation**:
```sql
-- Only these values are allowed
ALTER TABLE consumption_logs 
MODIFY action_type ENUM('PURCHASED', 'CONSUMED', 'WASTED', 'DONATED');

-- Invalid insert will raise error:
-- Error 1265: Data truncated for column 'action_type' at row 1
```

**Example Queries**:
```sql
-- Get waste statistics
SELECT action_type, COUNT(*) as count, SUM(quantity) as total_qty
FROM consumption_logs
WHERE user_id = ?
GROUP BY action_type;

-- Find all wasted items
SELECT * FROM consumption_logs
WHERE user_id = ? AND action_type = 'WASTED'
ORDER BY log_date DESC;
```

### ResourceType Enum (resources.resource_type)

**3 Valid Values**:

| Value | Meaning | Format | Best For |
|-------|---------|--------|----------|
| TIP | Quick actionable tip | Short text (100-300 words) | Quick reads, notifications |
| ARTICLE | Long-form content | Full markdown (1000+ words) | In-depth learning |
| VIDEO | Video tutorial | URL reference | Visual learners |

**SQL Validation**:
```sql
-- Only these values allowed
ALTER TABLE resources 
MODIFY resource_type ENUM('TIP', 'ARTICLE', 'VIDEO');
```

---

## 📊 Data Type Reference

Use this when creating related tables or fields:

| Data Type | MySQL Type | Precision | Use Cases |
|-----------|-----------|-----------|-----------|
| Quantities | DECIMAL(10,2) | 2 decimals | inventory.quantity, consumption_logs.quantity, food_items.average_cost |
| IDs | BIGINT UNSIGNED | 64-bit | All primary/foreign keys (supports 18+ billion records) |
| Dates | DATE | YYYY-MM-DD | inventory.purchase_date, inventory.expiration_date |
| Timestamps | DATETIME | YYYY-MM-DD HH:MM:SS | created_at, updated_at, consumption_logs.log_date |
| Text Fields | VARCHAR(255) | 255 chars | names, emails, categories |
| Long Text | LONGTEXT | 4GB | resources.content (supports markdown, HTML) |
| URLs | VARCHAR(2048) | 2048 chars | inventory.source_image_url (image URLs) |
| JSON | JSON | Native | dietary_preferences, ai_metadata |

**Why These Choices**:
- **DECIMAL not FLOAT**: Avoids floating-point precision errors in costs
- **BIGINT not INT**: Supports millions of users without overflow
- **DATETIME not TIMESTAMP**: Better for historical data, timezone-aware
- **JSON not TEXT**: Native querying, validation, better performance

---

## 🔒 Constraints & Rules

### NOT NULL Constraints

These fields **must always have a value**:
- `users.id`, `users.email`, `users.password_hash`, `users.household_size`
- `food_items.id`, `food_items.name`
- `inventory.id`, `inventory.user_id`, `inventory.quantity`
- `consumption_logs.id`, `consumption_logs.user_id`, `consumption_logs.action_type`, `consumption_logs.quantity`
- `resources.id`, `resources.title`, `resources.resource_type`

**API implication**: Always validate these are provided before INSERT/UPDATE.

### NULLABLE Fields

These fields **can be empty/null**:
- `users.full_name`, `users.dietary_preferences`, `users.location`
- `food_items.category`, `food_items.default_expiration_days`, `food_items.average_cost`, `food_items.unit`
- `inventory.food_item_id`, `inventory.custom_name`, `inventory.unit`, `inventory.purchase_date`, `inventory.expiration_date`, `inventory.source_image_url`, `inventory.ai_metadata`
- `consumption_logs.food_name`, `consumption_logs.reason_for_waste`
- `resources.category_tag`, `resources.content`

**API implication**: Optional fields can be omitted from requests.

### UNIQUE Constraints

Only one record per value:
- `users.email` — Each email can only register once
- `food_items.name` — Each food item has one canonical entry

**API implication**: Check for duplicates before INSERT, handle gracefully.

### DEFAULT Values

Automatic values if not provided:
- `users.household_size` → 1 (assumes single person)
- `users.created_at`, `users.updated_at` → NOW()
- `food_items.created_at`, `food_items.updated_at` → NOW()
- `inventory.quantity` → 0.00
- `inventory.created_at`, `inventory.updated_at` → NOW()
- `consumption_logs.log_date` → NOW() (auto-timestamp)
- `consumption_logs.created_at` → NOW()
- `resources.resource_type` → 'TIP'
- `resources.created_at`, `resources.updated_at` → NOW()

**API implication**: Can omit these in requests; database handles defaults.

---

## 👀 Views & Aggregations

### View 1: user_consumption_summary

**Purpose**: Get aggregated consumption statistics per user

**Columns Returned**:
| Column | Type | Calculation |
|--------|------|-------------|
| `user_id` | BIGINT | User identifier |
| `email` | VARCHAR | User email |
| `full_name` | VARCHAR | User display name |
| `total_purchased` | INT | COUNT of PURCHASED actions |
| `total_consumed` | INT | COUNT of CONSUMED actions |
| `total_wasted` | INT | COUNT of WASTED actions |
| `total_donated` | INT | COUNT of DONATED actions |
| `total_waste_qty` | DECIMAL | SUM of wasted quantities |
| `last_log_date` | DATETIME | Most recent log entry |

**Query**:
```sql
SELECT * FROM user_consumption_summary;

-- Returns:
-- user_id | email | full_name | total_purchased | total_consumed | total_wasted | total_donated | total_waste_qty | last_log_date
-- 1 | vegetarian.user@example.com | Test User | 3 | 1 | 1 | 0 | 1.00 | 2025-11-19 08:00:00
```

**Usage**:
- Dashboard statistics
- User analytics
- Sustainability reports
- Behavioral insights

---

### View 2: expiring_inventory

**Purpose**: Get items expiring within next 7 days (quick alerts)

**Columns Returned**:
| Column | Type | Calculation |
|--------|------|-------------|
| `id` | BIGINT | Inventory item ID |
| `user_id` | BIGINT | User who owns it |
| `email` | VARCHAR | User email (for notification) |
| `item_name` | VARCHAR | User's custom name |
| `food_item_name` | VARCHAR | Standard food name |
| `quantity` | DECIMAL | Current quantity |
| `unit` | VARCHAR | Unit of measurement |
| `expiration_date` | DATE | When it expires |
| `days_until_expiry` | INT | Days remaining (DATEDIFF) |

**Query**:
```sql
SELECT * FROM expiring_inventory
ORDER BY expiration_date ASC;

-- Returns items expiring soonest first
-- Useful for notifications, alerts, reminders
```

**Usage**:
- Expiration alerts
- Push notifications
- Email reminders
- Dashboard warnings

---

## ✅ Implementation Checklist

When implementing new features, ensure:

### Data Consistency

- [ ] All user inputs validated against data types (DECIMAL for quantities, etc.)
- [ ] Email validation before INSERT into users
- [ ] Quantity values never negative (enforce `>= 0`)
- [ ] Dates logical (expiration_date > purchase_date)
- [ ] JSON fields (dietary_preferences, ai_metadata) properly formatted
- [ ] Enum values only from allowed list (PURCHASED, CONSUMED, WASTED, DONATED)

### Foreign Key Integrity

- [ ] user_id always exists in users table
- [ ] food_item_id (if provided) exists in food_items table
- [ ] DELETE user cascades to inventory and consumption_logs
- [ ] DELETE food_item sets inventory.food_item_id to NULL
- [ ] No orphaned records (validate FKs on import)

### Performance

- [ ] Use indexed columns in WHERE clauses (user_id, expiration_date, log_date)
- [ ] Composite indexes for common queries (user_id + log_date)
- [ ] Avoid SELECT * on large tables
- [ ] Use pagination for list endpoints
- [ ] Cache user_consumption_summary (expensive aggregation)

### Data Relationships

- [ ] When showing inventory, JOIN food_items for category/expiration_days
- [ ] When showing consumption history, include food_name snapshot (not lookup)
- [ ] Never assume food_item_id exists (can be NULL)
- [ ] Preserve consumption_logs when deleting inventory items

### API Endpoints (Template)

For each feature, implement:

```
GET    /api/users/:id                    → users table
POST   /api/users                        → Create user
PUT    /api/users/:id                    → Update user
DELETE /api/users/:id                    → Delete user (cascades)

GET    /api/inventory                    → user_id's inventory
POST   /api/inventory                    → Add item
PUT    /api/inventory/:id                → Update quantity/dates
DELETE /api/inventory/:id                → Remove item

POST   /api/consumption/action           → Log action (purchase/consume/waste)
GET    /api/consumption/history          → consumption_logs
GET    /api/consumption/stats            → user_consumption_summary view

GET    /api/resources                    → All educational content
GET    /api/resources?type=TIP           → Filter by type/category

GET    /api/alerts/expiring              → expiring_inventory view
```

---

## 🎨 Feature Implementation Examples

### Example 1: Add Item to Inventory

**Fields to collect**:
- `food_item_id` (can lookup from food_items table)
- `custom_name` (optional, user's personal name)
- `quantity` (DECIMAL required)
- `unit` (should match food_items.unit)
- `purchase_date` (DATE)
- `expiration_date` (DATE, calculate from purchase_date + food_items.default_expiration_days)

**SQL**:
```sql
INSERT INTO inventory (user_id, food_item_id, custom_name, quantity, unit, purchase_date, expiration_date)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Also log the action
INSERT INTO consumption_logs (user_id, food_name, action_type, quantity, log_date)
VALUES (?, ?, 'PURCHASED', ?, NOW());
```

### Example 2: Log Consumption

**Fields to collect**:
- `quantity` (DECIMAL, how much was consumed)
- `action_type` (ENUM: 'CONSUMED', 'WASTED', 'DONATED')
- `reason_for_waste` (TEXT, only if action_type = 'WASTED')

**SQL**:
```sql
INSERT INTO consumption_logs (user_id, food_name, action_type, quantity, reason_for_waste)
VALUES (?, ?, ?, ?, ?);

-- Update inventory (decrease quantity)
UPDATE inventory
SET quantity = quantity - ?
WHERE id = ? AND user_id = ?;
```

### Example 3: Get User Dashboard

**Query**:
```sql
-- Get summary stats
SELECT * FROM user_consumption_summary WHERE user_id = ?;

-- Get expiring items (alert)
SELECT * FROM expiring_inventory WHERE user_id = ?;

-- Get recent consumption logs
SELECT * FROM consumption_logs 
WHERE user_id = ? 
ORDER BY log_date DESC 
LIMIT 10;

-- Get current inventory
SELECT i.*, f.default_expiration_days, f.category
FROM inventory i
LEFT JOIN food_items f ON i.food_item_id = f.id
WHERE i.user_id = ?
ORDER BY i.expiration_date ASC;
```

---

## 🔍 Query Patterns (Ready to Use)

### Search & Filter

**Find user by email**:
```sql
SELECT * FROM users WHERE email = ?;
```

**Get all items for user**:
```sql
SELECT * FROM inventory WHERE user_id = ? ORDER BY expiration_date;
```

**Find items expiring this week**:
```sql
SELECT * FROM expiring_inventory WHERE user_id = ? AND days_until_expiry <= 7;
```

**Get food item by name**:
```sql
SELECT * FROM food_items WHERE name = ?;
```

### Aggregations

**User waste statistics**:
```sql
SELECT 
  action_type,
  COUNT(*) as count,
  SUM(quantity) as total_qty
FROM consumption_logs
WHERE user_id = ?
GROUP BY action_type;
```

**Monthly consumption trend**:
```sql
SELECT 
  DATE_TRUNC('month', log_date) as month,
  action_type,
  COUNT(*) as count
FROM consumption_logs
WHERE user_id = ?
GROUP BY month, action_type
ORDER BY month DESC;
```

**Most wasted items**:
```sql
SELECT 
  food_name,
  COUNT(*) as waste_count,
  SUM(quantity) as total_wasted
FROM consumption_logs
WHERE user_id = ? AND action_type = 'WASTED'
GROUP BY food_name
ORDER BY total_wasted DESC;
```

---

## 📱 Mobile & Frontend Integration

### Data Expected by UI Components

**Registration Form**:
```
{
  email: "user@example.com",
  password: "plaintext_input",
  full_name: "John Doe",
  household_size: 2,
  dietary_preferences: ["Vegetarian"],
  location: "New York"
}
```

**Inventory Form**:
```
{
  food_item_id: 1,
  custom_name: "Organic Milk",
  quantity: 2.5,
  unit: "liter",
  purchase_date: "2025-11-19",
  expiration_date: "2025-11-26"
}
```

**Consumption Log Form**:
```
{
  inventory_id: 1,
  action_type: "WASTED",
  quantity: 0.5,
  reason_for_waste: "Expired"
}
```

**Dashboard Data Structure**:
```
{
  user: { id, email, full_name, household_size, dietary_preferences },
  stats: { total_purchased, total_consumed, total_wasted, total_donated, total_waste_qty },
  inventory: [
    { id, custom_name, quantity, unit, expiration_date, days_until_expiry }
  ],
  expiring_alerts: [
    { id, item_name, expiration_date, days_until_expiry }
  ],
  recent_logs: [
    { id, food_name, action_type, quantity, log_date }
  ]
}
```

---

## 🔐 Security Considerations

### What NOT to Return in API

- `password_hash` — Never send to frontend
- `ai_metadata` → Only for authorized users (privacy)
- `dietary_preferences` → Only to user or admin

### What to Validate

- `email` → Must be valid email format + unique
- `quantity` → Must be > 0
- `action_type` → Must be from enum
- `user_id` → Must match authenticated user (authorization)
- `dates` → Must be logical (expiration > purchase)

---

## 📞 Summary Table

| Table | Records | Purpose | Key Field |
|-------|---------|---------|-----------|
| users | 1 | Auth & profile | email (unique) |
| food_items | 8 | Master catalog | name (unique) |
| inventory | 4 | User's food | user_id, expiration_date |
| consumption_logs | 5 | Audit trail | user_id, log_date |
| resources | 6 | Education | resource_type |

| View | Used For |
|------|----------|
| user_consumption_summary | Dashboard stats |
| expiring_inventory | Alert system |

---

## 🚀 Next Steps for Feature Dev

1. **Understand the schema** — Read this doc before coding
2. **Match data types** — Use DECIMAL, DATETIME, JSON, ENUM as specified
3. **Respect relationships** — Don't bypass foreign keys
4. **Use indexes** — Query on user_id, expiration_date, log_date
5. **Follow patterns** — Use the query examples provided
6. **Validate inputs** — Check enums, nullability, constraints
7. **Preserve history** — Never delete consumption_logs

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Ready for Feature Development ✅

