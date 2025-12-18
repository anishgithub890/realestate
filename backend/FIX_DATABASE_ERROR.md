# Fix: "Incorrect database name ''" Error

## Problem
The error `Incorrect database name ''` means your `DATABASE_URL` in `.env` is empty or incorrectly formatted.

## Quick Fix

### Step 1: Edit backend/.env file

Open `backend/.env` and make sure `DATABASE_URL` is set correctly:

**For XAMPP MySQL (no password):**
```env
DATABASE_URL=mysql://root@localhost:3306/realestate
```

**For XAMPP MySQL (with password):**
```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/realestate
```

**For Docker MySQL:**
```env
DATABASE_URL=mysql://root:rootpassword@localhost:3306/realestate
```

### Step 2: Verify the Format

The format MUST be:
```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

**Important:**
- No spaces around `=`
- Database name must be `realestate` (we verified it exists)
- If no password, use: `mysql://root@localhost:3306/realestate`
- If password exists, use: `mysql://root:password@localhost:3306/realestate`

### Step 3: Restart the Server

After updating `.env`:
```bash
cd backend
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Common Mistakes

❌ **Wrong:**
```env
DATABASE_URL=mysql://root:rootpassword@localhost:3306/
DATABASE_URL=mysql://root:rootpassword@localhost:3306
DATABASE_URL=mysql://root:rootpassword@localhost:3306/realestate 
DATABASE_URL = mysql://root@localhost:3306/realestate
```

✅ **Correct:**
```env
DATABASE_URL=mysql://root@localhost:3306/realestate
DATABASE_URL=mysql://root:rootpassword@localhost:3306/realestate
```

## Test the Connection

After fixing, test if it works:

```bash
cd backend
npx prisma db pull
```

If this works, your connection is correct!

## Still Having Issues?

1. **Check if MySQL is running:**
   ```bash
   mysql -u root -e "SELECT 1;"
   ```

2. **Verify database exists:**
   ```bash
   mysql -u root -e "SHOW DATABASES LIKE 'realestate';"
   ```

3. **Check your .env file:**
   ```bash
   cd backend
   grep DATABASE_URL .env
   ```

4. **Try connecting manually:**
   ```bash
   mysql -u root -p realestate
   ```

If manual connection works but Prisma doesn't, the issue is in the `DATABASE_URL` format.

