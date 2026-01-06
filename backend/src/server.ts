import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import tenantRoutes from './routes/tenantRoutes';
import landlordRoutes from './routes/landlordRoutes';
import propertyRoutes from './routes/propertyRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import sessionRoutes from './routes/sessionRoutes';
import providerRoutes from './routes/providerRoutes';
import brokerRoutes from './routes/brokerRoutes';
import propertyViewingRoutes from './routes/propertyViewingRoutes';
import propertyAdvancedRoutes from './routes/propertyAdvancedRoutes';
import contractRoutes from './routes/contractRoutes';
import paymentRoutes from './routes/paymentRoutes';
import leadRoutes from './routes/leadRoutes';
import routingRoutes from './routes/routingRoutes';
import automationRoutes from './routes/automationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import integrationRoutes from './routes/integrationRoutes';
import micrositeRoutes from './routes/micrositeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import kanbanRoutes from './routes/kanbanRoutes';
import locationRoutes from './routes/locationRoutes';
import announcementRoutes from './routes/announcementRoutes';
import rentalApprovalRoutes from './routes/rentalApprovalRoutes';
import ticketRoutes from './routes/ticketRoutes';
import complaintRoutes from './routes/complaintRoutes';
import masterDataRoutes from './routes/masterDataRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

// Middleware
// CORS configuration - allow multiple origins in development
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow common localhost ports
    if (config.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // In production, use configured CORS_ORIGIN
    if (origin === config.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(apiLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Info endpoint (public)
app.get(`${config.API_PREFIX}`, (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Real Estate Management System API',
    version: '1.0.0',
    endpoints: {
      public: {
        health: '/health',
        auth: {
          login: 'POST /api/auth/login',
          oauth: 'POST /api/auth/oauth/token',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'POST /api/auth/reset-password',
          refreshToken: 'POST /api/auth/refresh',
        },
        provider: {
          signup: 'POST /api/providers/signup',
        },
      },
      protected: {
        auth: {
          me: 'GET /api/auth/me',
          companies: 'GET /api/auth/companies',
          selectCompany: 'POST /api/auth/select-company',
          logout: 'POST /api/auth/logout',
        },
        users: '/api/users/*',
        tenants: '/api/tenants/*',
        landlords: '/api/landlords/*',
        properties: '/api/buildings, /api/units, etc.',
        contracts: '/api/rental-contracts, /api/sales-contracts',
        viewings: '/api/viewings/*',
        brokers: '/api/brokers/*',
        payments: '/api/payments/*',
        '2fa': '/api/2fa/*',
        sessions: '/api/sessions/*',
        providers: '/api/providers/*',
      },
    },
    documentation: 'See API documentation for detailed endpoint information',
  });
});

// API Routes
app.use(`${config.API_PREFIX}/auth`, authRoutes);
app.use(`${config.API_PREFIX}/users`, userRoutes);
app.use(`${config.API_PREFIX}/tenants`, tenantRoutes);
app.use(`${config.API_PREFIX}/landlords`, landlordRoutes);
app.use(`${config.API_PREFIX}`, propertyRoutes);
app.use(`${config.API_PREFIX}/2fa`, twoFactorRoutes);
app.use(`${config.API_PREFIX}/sessions`, sessionRoutes);
app.use(`${config.API_PREFIX}/providers`, providerRoutes);
app.use(`${config.API_PREFIX}/brokers`, brokerRoutes);
app.use(`${config.API_PREFIX}/viewings`, propertyViewingRoutes);
app.use(`${config.API_PREFIX}`, propertyAdvancedRoutes);
app.use(`${config.API_PREFIX}`, contractRoutes);
app.use(`${config.API_PREFIX}/payments`, paymentRoutes);
app.use(`${config.API_PREFIX}/leads`, leadRoutes);
app.use(`${config.API_PREFIX}/routing`, routingRoutes);
app.use(`${config.API_PREFIX}/automation`, automationRoutes);
app.use(`${config.API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${config.API_PREFIX}/integrations`, integrationRoutes);
app.use(`${config.API_PREFIX}/microsites`, micrositeRoutes);
app.use(`${config.API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${config.API_PREFIX}/kanban`, kanbanRoutes);
app.use(`${config.API_PREFIX}/locations`, locationRoutes);
app.use(`${config.API_PREFIX}/announcements`, announcementRoutes);
app.use(`${config.API_PREFIX}/rental-approvals`, rentalApprovalRoutes);
app.use(`${config.API_PREFIX}/tickets`, ticketRoutes);
app.use(`${config.API_PREFIX}/complaints`, complaintRoutes);
app.use(`${config.API_PREFIX}/master-data`, masterDataRoutes);
app.use(`${config.API_PREFIX}/requests`, requestRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}${config.API_PREFIX}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;

