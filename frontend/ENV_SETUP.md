# Environment Variables Setup

## Frontend Environment File

Create a `.env.local` file in the `frontend` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Add other environment variables here
# NEXT_PUBLIC_APP_NAME=Real Estate Management System
```

## Instructions

1. **Create the file**:
   ```bash
   cd frontend
   touch .env.local
   ```

2. **Add the content**:
   Copy the environment variables above into `.env.local`

3. **Update if needed**:
   - If your backend runs on a different port, update `NEXT_PUBLIC_API_URL`
   - For production, use your production API URL

## Important Notes

- `.env.local` is already in `.gitignore` and won't be committed
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Restart the dev server after changing environment variables
- The default backend URL is `http://localhost:3000/api`

