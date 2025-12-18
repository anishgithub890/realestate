# MySQL Workbench Setup Guide

## Option 1: Using XAMPP MySQL (Current Setup)

### Step 1: Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Start the MySQL service
3. Verify it's running on port 3306

### Step 2: Create Database
Run the following command to create the database:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 3: Connect to MySQL Workbench

**Connection Details:**
- **Connection Name**: Real Estate DB (or any name you prefer)
- **Hostname**: `127.0.0.1` or `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: (Leave empty if no password is set, or use your XAMPP MySQL root password)
- **Default Schema**: `realestate`

### Step 4: Test Connection
1. Open MySQL Workbench
2. Click the "+" icon to add a new connection
3. Enter the connection details above
4. Click "Test Connection"
5. If successful, click "OK" to save

### Step 5: Update .env File
Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/realestate
```

If your MySQL root user has no password:
```env
DATABASE_URL=mysql://root@localhost:3306/realestate
```

---

## Option 2: Using Docker (If you install Docker later)

### Step 1: Start MySQL Container
```bash
cd backend
docker compose up -d db
```

### Step 2: Connect to MySQL Workbench

**Connection Details:**
- **Hostname**: `127.0.0.1` or `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: `rootpassword`
- **Default Schema**: `realestate`

### Step 3: Update .env File
```env
DATABASE_URL=mysql://root:rootpassword@localhost:3306/realestate
```

---

## Option 3: Install MySQL via Homebrew

If you prefer a standalone MySQL installation:

```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation (set root password)
mysql_secure_installation
```

Then use the connection details:
- **Hostname**: `127.0.0.1`
- **Port**: `3306`
- **Username**: `root`
- **Password**: (the password you set during secure installation)

---

## After Database Setup

Once connected to MySQL Workbench:

1. **Run Prisma Migrations**:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

2. **Verify Tables**: In MySQL Workbench, you should see all the tables created by Prisma

3. **Optional - Seed Database**:
   ```bash
   npm run prisma:seed
   ```

---

## Troubleshooting

### Connection Refused
- Make sure MySQL service is running
- Check if port 3306 is available: `lsof -i :3306`

### Access Denied
- Verify username and password
- For XAMPP, default root user might not have a password
- Try resetting password if needed

### Database Not Found
- Create the database manually:
  ```sql
  CREATE DATABASE realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

