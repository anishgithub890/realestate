# Real Estate Management System

A comprehensive real estate management system built with Next.js frontend and Node.js/Express.js backend, supporting multi-tenant architecture with role-based access control.

## 🏗️ Project Structure

```
real-estate-module/
├── backend/          # Node.js/Express.js Backend API
│   ├── src/         # Source code
│   ├── prisma/       # Database schema and migrations
│   └── ...
└── frontend/         # Next.js Frontend (to be implemented)
```

## 🚀 Features

### Backend Features
- ✅ Authentication & Authorization (OAuth2, JWT, 2FA)
- ✅ User Management with Role-Based Access Control
- ✅ Multi-tenant Company Management
- ✅ Tenant & Landlord Management
- ✅ Property Management (Buildings, Units, Floors, Amenities)
- ✅ Contract Management (Rental & Sales)
- ✅ Payment & Receipt Management
- ✅ Lead/Inquiry Management
- ✅ Ticket/Maintenance Management
- ✅ Complaint & Suggestion Management
- ✅ Reports & Analytics
- ✅ Master Data Management
- ✅ Announcement Management
- ✅ Rental Approval Workflow
- ✅ Session Management
- ✅ OAuth Provider Signup (Google, Facebook, Apple, Microsoft)
- ✅ Two-Step Verification (2FA)
- ✅ Broker Management with RERA License Tracking
- ✅ Property Viewings/Appointments
- ✅ Property Favorites
- ✅ Property Inspections
- ✅ Property Valuations
- ✅ Property Insurance
- ✅ Property Maintenance History
- ✅ Property Notifications
- ✅ Property Analytics

### Dubai Real Estate Specific Features
- Ejari Integration
- DEWA Account Management
- RERA License Tracking
- Municipality Fees Tracking
- GPS Coordinates for Properties
- Virtual Tour URLs
- Featured & Verified Property Flags

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Cache**: Redis
- **Authentication**: OAuth2 (Password Grant), JWT, 2FA (TOTP)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Redis
- npm or yarn

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE realestate;"
   
   # Import schema
   mysql -u root -p realestate < mysql-schema.sql
   
   # Import sample data (optional)
   mysql -u root -p realestate < sample_data.sql
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 Documentation

- [Backend Installation Guide](backend/INSTALLATION.md)
- [API Endpoints](backend/API_ENDPOINTS.md)
- [MySQL Workbench Setup](backend/MYSQL_WORKBENCH_SETUP.md)
- [Complete Features List](backend/COMPLETE_FEATURES_LIST.md)

## 🔐 Default Login Credentials

After importing sample data:
- **Email**: `admin@realestate.com`
- **Password**: `admin123`

## 📝 API Documentation

Base URL: `http://localhost:3000/api`

See [API_ENDPOINTS.md](backend/API_ENDPOINTS.md) for complete API documentation.

## 🗄️ Database

- **Schema**: See `backend/prisma/schema.prisma`
- **SQL Schema**: `backend/mysql-schema.sql`
- **Sample Data**: `backend/sample_data.sql`

## 🧪 Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Project Status

- ✅ Backend API - Complete
- ⏳ Frontend - To be implemented

## 🤝 Contributing

This is a private project. For contributions, please contact the repository owner.

## 📄 License

Private - All rights reserved

## 👥 Author

Anish Mahato

---

For detailed setup instructions, see [INSTALLATION.md](backend/INSTALLATION.md)

