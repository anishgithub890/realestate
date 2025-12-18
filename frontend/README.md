# Real Estate Management System - Frontend

Next.js 15 frontend application for the Real Estate Management System.

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.3
- **React**: 19.0.0
- **UI Library**: shadcn/ui, Radix UI
- **State Management**: Redux Toolkit, TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Recharts
- **PDF**: React PDF, jsPDF
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (main)/            # Main application pages
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── properties/
│   │   ├── tenants/
│   │   ├── landlords/
│   │   ├── contracts/
│   │   ├── leads/
│   │   ├── tickets/
│   │   ├── complaints/
│   │   ├── reports/
│   │   └── settings/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to login)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and API client
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication service
│   └── utils.ts          # Utility functions
├── store/                # Redux store
│   ├── index.ts         # Store configuration
│   └── slices/          # Redux slices
└── public/              # Static assets
```

## 🔐 Authentication

The frontend uses JWT tokens stored in localStorage for authentication. The API client automatically includes the token in requests.

### Login Flow

1. User enters email and password
2. Optional: Company selection (if user has multiple companies)
3. Optional: Two-factor authentication code (if 2FA is enabled)
4. Token is stored and user is redirected to dashboard

## 📱 Features

### Implemented Pages

- ✅ Login page with 2FA support
- ✅ Forgot password page
- ✅ Dashboard with statistics
- ✅ User management page
- ✅ Properties listing page
- ✅ Tenants management page
- ✅ Landlords management page
- ✅ Contracts page (Rental & Sales)
- ✅ Leads management page
- ✅ Tickets page
- ✅ Complaints page
- ✅ Reports page
- ✅ Settings page

### Components

- ✅ Sidebar navigation
- ✅ Header with user info
- ✅ shadcn/ui components (Button, Input, Card, Table, Label)
- ✅ Layout components

## 🔄 State Management

- **Redux Toolkit**: Global state (auth, company)
- **TanStack Query**: Server state and caching

## 🎨 Styling

- Tailwind CSS for styling
- shadcn/ui components for consistent UI
- Responsive design

## 📝 API Integration

All API calls go through the centralized API client in `lib/api.ts` which:
- Automatically adds authentication tokens
- Handles errors (401 redirects to login)
- Provides type-safe methods

## 🚧 Next Steps

- [ ] Complete form components for CRUD operations
- [ ] Add data tables with pagination
- [ ] Implement charts and analytics
- [ ] Add file upload functionality
- [ ] Create PDF generation components
- [ ] Add more detailed pages for each module
- [ ] Implement filters and search
- [ ] Add toast notifications
- [ ] Create modals and dialogs

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Redux Toolkit](https://redux-toolkit.js.org)

