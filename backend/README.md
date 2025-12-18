# Real Estate Management System - Backend API

A comprehensive backend API for real estate management built with Node.js, Express.js, TypeScript, Prisma, and MySQL.

## Features

- 🔐 OAuth2 Authentication with JWT
- 👥 Multi-tenant architecture
- 🔑 Role-based access control (RBAC)
- 📊 Complete CRUD operations for all modules
- 💾 Redis caching layer
- 📧 Email notifications
- 📄 File upload support
- 🐳 Docker containerization
- 🚀 Production-ready with error handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Authentication**: OAuth2 (Password Grant) with JWT

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0
- Redis 7
- Docker (optional, for containerized setup)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: Configure in environment variables

### Authentication

All protected endpoints require an Authorization header:
```
Authorization: Bearer <access_token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Prisma models (generated)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed script
├── uploads/             # File uploads directory
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Backend Dockerfile
└── package.json
```

## Modules

1. Authentication & Authorization
2. User Management
3. Tenant Management
4. Landlord Management
5. Property Management
6. Contract Management
7. Payment & Receipt Management
8. Lead/Inquiry Management
9. Request Management
10. Ticket/Maintenance Management
11. Complaint & Suggestion Management
12. Reports
13. Master Data Management
14. Announcement Management
15. Rental Approval
16. Company Management
17. Dashboard

## Security

- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting with Redis
- Input validation with express-validator
- SQL injection prevention with Prisma
- CORS configuration
- XSS protection

## License

ISC

