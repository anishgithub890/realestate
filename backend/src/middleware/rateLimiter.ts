import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { Request, Response, NextFunction } from 'express';

// No-op middleware that just passes through (when rate limiting is disabled)
const noOpLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

// API rate limiter (can be disabled via RATE_LIMIT_ENABLED=false)
export const apiLimiter = config.RATE_LIMIT_ENABLED
  ? rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
  : noOpLimiter;

// Auth rate limiter (can be disabled via RATE_LIMIT_ENABLED=false)
export const authLimiter = config.RATE_LIMIT_ENABLED
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per window
      message: {
        success: false,
        error: 'Too many login attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      },
      skipSuccessfulRequests: true,
    })
  : noOpLimiter;

