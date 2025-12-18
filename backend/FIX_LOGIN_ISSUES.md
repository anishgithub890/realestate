# Login Issues Fixed

## Issues Found and Resolved

### 1. ✅ Password Hash Mismatch
**Problem:** The password hash in the database didn't match "admin123"

**Solution:** Updated the password hash in the database to match the sample data:
```sql
UPDATE User SET password = '$2a$10$fWBD84w3IdvJXxMuQyBR8e23FY.eYX9eyIYzf08CcxQcHCFmxoSgu' 
WHERE email = 'admin@realestate.com';
```

### 2. ✅ Access Token Column Too Small
**Problem:** `access_token` column was `VARCHAR(191)` which is too small for JWT tokens

**Solution:** Updated columns to TEXT:
```sql
ALTER TABLE OAuthToken MODIFY COLUMN access_token TEXT;
ALTER TABLE OAuthToken MODIFY COLUMN refresh_token TEXT;
```

### 3. ✅ Duplicate Token Entry
**Problem:** Old tokens in database causing conflicts

**Solution:** Cleared old tokens:
```sql
DELETE FROM OAuthToken;
```

## Default Login Credentials

- **Email:** `admin@realestate.com`
- **Password:** `admin123`

## Testing Login

You can test the login endpoint:

```bash
curl -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realestate.com","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@realestate.com",
      "role": {...},
      "company": {...}
    }
  },
  "message": "Login successful"
}
```

## Database Schema Update

If you need to recreate the database schema with the correct column types, update the Prisma schema:

```prisma
model OAuthToken {
  id            Int      @id @default(autoincrement())
  user_id       Int
  access_token  String   @db.Text @unique
  refresh_token String?  @db.Text @unique
  expires_at    DateTime
  created_at    DateTime @default(now())
  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([access_token])
}
```

Then run:
```bash
npm run prisma:migrate
```

## Status

✅ All login issues have been resolved. The login endpoint should now work correctly.

### ⚠️ Rate Limiter Note

The auth rate limiter allows 5 login attempts per 15 minutes. If you see "Too many login attempts", you need to:

1. **Restart the backend server** (this clears the in-memory rate limit):
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   cd backend
   npm run dev
   ```

2. **Or wait 15 minutes** for the rate limit to expire

The rate limiter is configured to allow 5 failed login attempts per 15-minute window to prevent brute force attacks.

