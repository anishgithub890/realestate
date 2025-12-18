# Database Setup Guide

## Issue: "Incorrect database name ''"

This error occurs when the `DATABASE_URL` in your `.env` file is not properly configured.

## Solution

### Step 1: Check Your MySQL Database

First, ensure MySQL is running and the database exists:

```bash
# Check if MySQL is running
mysql -u root -p -e "SHOW DATABASES;"
```

### Step 2: Create the Database (if it doesn't exist)

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Or using MySQL Workbench:
1. Connect to your MySQL server
2. Run: `CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### Step 3: Configure .env File

Edit the `backend/.env` file and set the `DATABASE_URL` correctly:

#### For Local MySQL (XAMPP/Standalone):

**If MySQL has NO password:**
```env
DATABASE_URL=mysql://root@localhost:3306/realestate
```

**If MySQL has a password:**
```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/realestate
```

**If using a different user:**
```env
DATABASE_URL=mysql://username:password@localhost:3306/realestate
```

#### For Docker MySQL:
```env
DATABASE_URL=mysql://root:rootpassword@localhost:3306/realestate
```

### Step 4: Verify the Connection String Format

The format should be:
```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

Example:
```
mysql://root:rootpassword@localhost:3306/realestate
```

### Step 5: Test the Connection

1. **Restart the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check if Prisma can connect:**
   ```bash
   cd backend
   npx prisma db pull
   ```

### Step 6: Run Migrations (if needed)

If the database is empty, you can either:

**Option A: Import SQL schema**
```bash
mysql -u root -p realestate < mysql-schema.sql
```

**Option B: Use Prisma migrations**
```bash
cd backend
npm run prisma:migrate
```

## Common Issues

### Issue 1: Empty Database Name
**Error:** `Incorrect database name ''`

**Solution:** Check your `.env` file - the database name in `DATABASE_URL` is missing or empty.

### Issue 2: Database Doesn't Exist
**Error:** `Unknown database 'realestate'`

**Solution:** Create the database first (see Step 2).

### Issue 3: Wrong Credentials
**Error:** `Access denied for user`

**Solution:** Check your MySQL username and password in the `DATABASE_URL`.

### Issue 4: MySQL Not Running
**Error:** `Can't connect to MySQL server`

**Solution:** 
- Start MySQL service
- For XAMPP: Start MySQL from XAMPP Control Panel
- For Docker: `docker-compose up -d db`

## Quick Setup Script

If you're using XAMPP on macOS:

```bash
# 1. Start XAMPP MySQL from Control Panel

# 2. Create database
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Update .env file
# Edit backend/.env and set:
# DATABASE_URL=mysql://root@localhost:3306/realestate

# 4. Import schema
mysql -u root realestate < backend/mysql-schema.sql

# 5. Import sample data (optional)
mysql -u root realestate < backend/sample_data.sql
```

## Verification

After setup, verify everything works:

```bash
cd backend

# Test Prisma connection
npx prisma db pull

# Start server
npm run dev
```

The server should start without database connection errors.

