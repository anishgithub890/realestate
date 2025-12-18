# Fixed: CORS Error

## Problem
```
Access to XMLHttpRequest at 'http://localhost:3007/api/auth/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3001' that is not equal to the supplied origin.
```

## Root Cause
- Frontend is running on `http://localhost:3000` (default Next.js port)
- Backend CORS was configured to only allow `http://localhost:3001`
- This caused the browser to block the request due to CORS policy

## Solution

### 1. Updated Backend CORS Configuration
Modified `backend/src/server.ts` to:
- Allow multiple origins in development mode
- Support both `http://localhost:3000` and `http://localhost:3001`
- Maintain strict origin checking in production

### 2. Updated Default CORS Origin
Changed `backend/src/config/env.ts` default from `http://localhost:3001` to `http://localhost:3000`

## Changes Made

### `backend/src/server.ts`
- Enhanced CORS configuration to handle multiple origins in development
- Added support for common localhost ports (3000, 3001)
- Added proper methods and headers configuration

### `backend/src/config/env.ts`
- Updated default `CORS_ORIGIN` to `http://localhost:3000`

## Environment Variable

If you need to customize the CORS origin, set it in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

Or for production:
```env
CORS_ORIGIN=https://yourdomain.com
```

## Testing

After restarting the backend server, the CORS error should be resolved:
1. Frontend on `http://localhost:3000` can now make requests to backend
2. Login and all API calls should work without CORS errors

## Status

✅ **Fixed** - CORS now allows requests from `http://localhost:3000` and other common development ports.

