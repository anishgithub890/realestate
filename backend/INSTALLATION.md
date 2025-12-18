# Installation & Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0
- Redis 7
- Docker (optional)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection string
- Redis URL
- JWT secrets
- SMTP settings
- OAuth provider credentials

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# (Optional) Seed database with initial data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## New Dependencies

After pulling the latest code, install new dependencies:

```bash
npm install otplib
```

## Database Migration

After schema changes, run:

```bash
# Create migration
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@realestate.com",
    "password": "admin123"
  }'
```

### Login with 2FA (if enabled)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@realestate.com",
    "password": "admin123",
    "two_factor_token": "123456"
  }'
```

## Troubleshooting

### Prisma Migration Issues
If you encounter migration errors:
1. Check database connection in `.env`
2. Ensure MySQL is running
3. Try: `npx prisma migrate reset` (WARNING: This will delete all data)

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

### Port Already in Use
Change `PORT` in `.env` or kill the process using port 3000

## Next Steps

1. Test all endpoints using Postman or similar
2. Set up frontend to consume these APIs
3. Configure OAuth providers (Google, Facebook, etc.)
4. Set up email service (SMTP)
5. Configure file upload storage

