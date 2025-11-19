-- ============================================================================
-- SQL FILES DIRECTORY SUMMARY
-- ============================================================================
-- File: sql/README.md (or view this via: cat sql/core_schema.sql | head -50)
-- 
-- This directory contains complete, standalone MySQL database files that can
-- be imported directly into MySQL without Prisma or Node.js.
--
-- ============================================================================

## 📁 SQL Files Overview

### 1. core_schema.sql (222 lines)
**Purpose**: Create complete database schema with all tables, relationships, and views

**Creates**:
- Database: `bubt_hackathon_db`
- Tables: users, food_items, inventory, consumption_logs, resources
- Views: user_consumption_summary, expiring_inventory
- Indexes: 10+ performance indexes
- Foreign Keys: Proper constraints with CASCADE and SET NULL rules
- Enums: action_type (PURCHASED, CONSUMED, WASTED, DONATED), resource_type (TIP, ARTICLE, VIDEO)
- JSON Support: dietaryPreferences, aiMetadata fields

**Run**:
```bash
mysql -u root -p < sql/core_schema.sql
```

**Time**: ~2 seconds
**Status**: Ready for production

---

### 2. seed_data.sql (170 lines)
**Purpose**: Populate initial data (master records and sample user data)

**Inserts**:
- 8 FoodItem records (Milk, Rice, Eggs, Spinach, Apples, Bread, Chicken, Tomato)
- 6 Resource records (educational tips and articles)
- 1 Test User (vegetarian.user@example.com with dietary preferences)
- 4 Sample Inventory items (linked to test user)
- 5 Sample ConsumptionLog entries (PURCHASED, CONSUMED, WASTED actions)

**Dependencies**: Requires core_schema.sql to run first

**Run**:
```bash
mysql -u root -p < sql/seed_data.sql
```

**Time**: ~1 second
**Status**: Idempotent (safe to run multiple times)

---

### 3. smoke_test.sql (280 lines)
**Purpose**: Validate schema correctness and data integrity

**Verifies**:
- Section 1: Database existence and character set
- Section 2: All table structures and columns
- Section 3: All indexes are created properly
- Section 4: Foreign key relationships and cascade rules
- Section 5: Enum definitions
- Section 6: JSON columns
- Section 7: Views are created
- Section 8: Data row counts
- Section 9: Sample data queries
- Section 10: Query performance (joins, aggregations)
- Section 11: Transaction support (ACID compliance)

**Run** (see validation results):
```bash
mysql -u root -p < sql/smoke_test.sql
```

**Time**: ~2 seconds
**Output**: ~500+ lines of verification data

**Expected Results**:
```
✅ 5 BASE TABLES
✅ 2 VIEWS
✅ 10+ INDEXES
✅ 4 FOREIGN KEYS
✅ 2 ENUM TYPES
✅ 2 JSON COLUMNS
✅ Transaction support: PASS
```

---

### 4. SETUP.md (Reference Guide)
**Purpose**: Step-by-step installation and troubleshooting guide

**Covers**:
- Prerequisite checks (MySQL version, CLI tools)
- Step-by-step import instructions
- Verification queries
- Troubleshooting common errors
- Application configuration (.env setup)
- Using with Node.js and Prisma
- Production deployment notes

**Read First**: Yes, especially if new to MySQL command-line

---

## 🚀 Quick Start (3 Steps)

```bash
# 1. Import core schema (creates database)
mysql -u root -p < sql/core_schema.sql

# 2. Seed initial data (optional but recommended)
mysql -u root -p < sql/seed_data.sql

# 3. Run validation (verify everything)
mysql -u root -p < sql/smoke_test.sql > validation_results.txt
cat validation_results.txt
```

## 📊 Database Specification

| Component | Count |
|-----------|-------|
| Tables | 5 |
| Views | 2 |
| Indexes | 10+ |
| Foreign Keys | 4 |
| Enums | 2 |
| JSON Fields | 2 |
| Total Columns | 42+ |
| Character Set | utf8mb4 (international) |
| Storage Engine | InnoDB (ACID compliant) |

## 🔗 Table Relationships

```
users (1)
  ├─→ (N) inventory
  │   ├─→ (?) food_items (SetNull if deleted)
  │   └─→ [JSON] aiMetadata
  │
  ├─→ (N) consumption_logs
  │   └─→ [ENUM] action_type
  │
  └─→ [JSON] dietary_preferences

food_items (1)
  └─→ (N) inventory

resources (standalone)
  └─→ [ENUM] resource_type
```

## 🎯 Use Cases

### 1. Local Development
```bash
mysql -u root < sql/core_schema.sql
mysql -u root < sql/seed_data.sql
npm install
npm run dev
```

### 2. Docker/Container Setup
```dockerfile
COPY sql/core_schema.sql /docker-entrypoint-initdb.d/
COPY sql/seed_data.sql /docker-entrypoint-initdb.d/
```

### 3. Production Deployment
```bash
# Backup existing data first!
mysqldump -u root -p bubt_hackathon_db > backup.sql

# Then import (if fresh installation)
mysql -u root -p < sql/core_schema.sql
mysql -u root -p < sql/seed_data.sql
```

### 4. CI/CD Pipeline
```bash
#!/bin/bash
mysql -u testuser -p$DB_PASSWORD < sql/core_schema.sql || exit 1
mysql -u testuser -p$DB_PASSWORD < sql/seed_data.sql || exit 1
npm test
```

## 📋 Field Specifications

### users
- `id`: BIGINT AUTO_INCREMENT (primary key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `full_name`: VARCHAR(255)
- `household_size`: INT DEFAULT 1
- `dietary_preferences`: JSON (array of strings)
- `location`: VARCHAR(255)
- `created_at`, `updated_at`: DATETIME with auto-timestamps

### food_items
- `id`: BIGINT AUTO_INCREMENT
- `name`: VARCHAR(255) UNIQUE
- `category`: VARCHAR(100)
- `default_expiration_days`: INT
- `average_cost`: DECIMAL(10,2)
- `unit`: VARCHAR(50) (kg, liter, piece, dozen)

### inventory
- `id`: BIGINT AUTO_INCREMENT
- `user_id`: BIGINT (FK → users, CASCADE)
- `food_item_id`: BIGINT (FK → food_items, SET NULL)
- `custom_name`: VARCHAR(255)
- `quantity`: DECIMAL(10,2)
- `unit`: VARCHAR(50)
- `purchase_date`: DATE
- `expiration_date`: DATE (indexed for expiry queries)
- `source_image_url`: VARCHAR(2048)
- `ai_metadata`: JSON

### consumption_logs
- `id`: BIGINT AUTO_INCREMENT
- `user_id`: BIGINT (FK → users, CASCADE)
- `food_name`: VARCHAR(255)
- `action_type`: ENUM('PURCHASED', 'CONSUMED', 'WASTED', 'DONATED')
- `quantity`: DECIMAL(10,2)
- `reason_for_waste`: TEXT
- `log_date`: DATETIME (auto now, indexed)

### resources
- `id`: BIGINT AUTO_INCREMENT
- `title`: VARCHAR(255)
- `content`: LONGTEXT
- `category_tag`: VARCHAR(100)
- `resource_type`: ENUM('TIP', 'ARTICLE', 'VIDEO')

## 🔑 Indexes (Performance)

Primary (by table):
- users: id (PK), email (UNIQUE)
- food_items: id (PK), name (UNIQUE)
- inventory: id (PK), user_id, expiration_date, food_item_id, purchase_date
- consumption_logs: id (PK), user_id, log_date, action_type, (user_id, log_date)
- resources: id (PK), category_tag, resource_type

## ✅ Validation Checklist

After importing, verify:
- [ ] Database `bubt_hackathon_db` exists
- [ ] All 5 tables present
- [ ] All views created
- [ ] Foreign keys working (run `SELECT` from inventory, should show user/food_item data)
- [ ] Enums enforced (try `INSERT INTO consumption_logs ... action_type='INVALID'` — should fail)
- [ ] JSON columns work (try querying `dietary_preferences->>'$[0]'`)
- [ ] Sample data inserted (8 food items, 6 resources, 1 user)
- [ ] Indexes present (run `SHOW INDEX FROM inventory` — should list 4 indexes)
- [ ] Timestamps auto-updating (update a record, check `updated_at`)

---

## 🛠️ Common Operations

### Show all databases
```sql
SHOW DATABASES;
```

### Switch to this database
```sql
USE bubt_hackathon_db;
```

### List all tables
```sql
SHOW TABLES;
```

### Check table structure
```sql
DESCRIBE inventory;
```

### View all indexes
```sql
SHOW INDEX FROM inventory;
```

### View foreign keys
```sql
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'bubt_hackathon_db' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Query user consumption summary
```sql
SELECT * FROM user_consumption_summary;
```

### Find expiring items
```sql
SELECT * FROM expiring_inventory;
```

### Backup database
```bash
mysqldump -u root -p bubt_hackathon_db > backup.sql
```

### Restore from backup
```bash
mysql -u root -p bubt_hackathon_db < backup.sql
```

---

## 📝 Notes

1. **COLLATION**: Uses `utf8mb4_unicode_ci` for case-insensitive international text support
2. **ENGINE**: InnoDB for ACID compliance, foreign keys, and transactions
3. **JSON**: Fully supported and queryable in MySQL 5.7+
4. **DECIMAL**: Used instead of FLOAT for cost/quantity to avoid precision loss
5. **Cascade Rules**: 
   - Deleting a user cascades to inventory and logs (cleanup)
   - Deleting a food_item sets FK to NULL in inventory (preserve history)

---

## 🔐 Security Notes

- Use strong passwords for MySQL user accounts
- Never commit `.env` files with credentials
- Use SSL for remote MySQL connections
- Implement application-level authorization checks
- Hash passwords with bcrypt (don't store plaintext)
- Validate all user input before database queries

---

**Last Updated**: November 2025
**Status**: Production Ready ✅

