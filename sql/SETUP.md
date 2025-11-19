# MySQL Database Setup Guide

## Quick Start

This guide walks you through importing the SQL schema and validating your database setup.

---

## Prerequisites

- **MySQL Server** (5.7 or higher, 8.0+ recommended)
- **MySQL CLI** or MySQL Workbench installed
- A user account with database creation privileges
- (Optional) A `.env` file configured with your MySQL credentials

---

## Step 1: Verify MySQL is Running

```bash
# Check if MySQL server is running
mysql --version

# Test connection (if password required, add -p)
mysql -u root -e "SELECT 1;"
```

If MySQL is not installed, install it:

**macOS (via Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation  # optional: set root password
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Windows:**
Download from https://dev.mysql.com/downloads/mysql/

---

## Step 2: Import the Core Schema

Run the SQL file to create the database and all tables:

```bash
cd /Users/punam/Desktop/Internship\ or\ Courses/Competitions/Current/Bubt\ Hackathon/database

# Option A: Direct import (no password)
mysql -u root < sql/core_schema.sql

# Option B: With password prompt
mysql -u root -p < sql/core_schema.sql

# Option C: Specify password directly (less secure, for scripts)
mysql -u root -pYOUR_PASSWORD < sql/core_schema.sql

# Option D: Using MySQL Workbench
#   1. Open Workbench
#   2. File → Open SQL Script → select sql/core_schema.sql
#   3. Click the lightning bolt (Execute) button
```

---

## Step 3: Verify Schema Creation

After import, verify the database and tables were created:

```bash
# Login to MySQL
mysql -u root -p

# Inside MySQL CLI:
mysql> USE bubt_hackathon_db;
mysql> SHOW TABLES;
```

You should see output like:
```
+---------------------------+
| Tables_in_bubt_hackathon_db |
+---------------------------+
| consumption_logs          |
| food_items                |
| inventory                 |
| resources                 |
| users                      |
+---------------------------+
```

---

## Step 4: Run Smoke Tests

Execute the smoke test file to verify all tables and relationships:

```bash
mysql -u root -p < sql/smoke_test.sql
```

This will output:
- Table structure and record counts
- Foreign key relationships
- Sample queries to confirm connectivity

---

## Step 5: (Optional) Seed Sample Data

Import sample data (8 food items, 6 resources, test user):

```bash
mysql -u root -p < sql/seed_data.sql
```

Verify data was inserted:

```bash
mysql -u root -p -e "USE bubt_hackathon_db; SELECT COUNT(*) AS total_users FROM users; SELECT COUNT(*) AS total_food_items FROM food_items; SELECT COUNT(*) AS total_resources FROM resources;"
```

---

## Step 6: Configure Your Application

Update your `.env` file with the database credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/bubt_hackathon_db"
```

If using Prisma:

```bash
npx prisma db push
npx prisma generate
```

If using raw Node.js (`mysql2` or similar):

```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'bubt_hackathon_db'
});

const [rows] = await connection.execute('SELECT * FROM users;');
console.log(rows);
```

---

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solution:** Make sure you're using the correct password. If you haven't set a password:

```bash
mysql -u root  # without -p flag
```

### Error: "Can't connect to MySQL server"

**Solution:** Ensure MySQL is running:

```bash
# macOS
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows (in PowerShell as admin)
net start MySQL80  # adjust version number
```

### Error: "Database 'bubt_hackathon_db' already exists"

**Solution:** Edit `sql/core_schema.sql` and uncomment the DROP DATABASE line, or use:

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS bubt_hackathon_db;" && mysql -u root -p < sql/core_schema.sql
```

### Error: "Foreign key constraint fails"

**Solution:** Ensure all tables are created in the correct order. The core_schema.sql handles this automatically, but if you run parts separately, create tables in this order:
1. `users`
2. `food_items`
3. `inventory` (depends on users, food_items)
4. `consumption_logs` (depends on users)
5. `resources` (no dependencies)

---

## File Structure

```
sql/
├── core_schema.sql          # Main DDL (tables, indexes, views)
├── seed_data.sql            # Sample data insertion
├── smoke_test.sql           # Validation queries
└── SETUP.md                 # This file
```

---

## What Gets Created

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | System users with auth | 1 test user |
| `food_items` | Master food catalog | 8 sample items |
| `inventory` | User's food inventory | Depends on usage |
| `consumption_logs` | Audit trail of actions | Depends on usage |
| `resources` | Educational content | 6 articles/tips |

---

## Views Created

- **`user_consumption_summary`** — Aggregated stats per user (purchases, consumed, wasted, donated)
- **`expiring_inventory`** — Items expiring within 7 days

Query a view:

```sql
SELECT * FROM user_consumption_summary;
SELECT * FROM expiring_inventory;
```

---

## Next Steps

1. **For Prisma users:** Run `npx prisma generate` to sync Prisma Client with the database
2. **For Node.js:** Create API endpoints using `lib/transactions.js`
3. **For Frontend:** Use the data structure to design registration, inventory, and logging UI
4. **For Production:** Consider adding backups, replication, and SSL for remote connections

---

## More Information

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [InnoDB Storage Engine](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)

