import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { sendError } from '../utils/response';
import prisma from '../config/database';
import { cache } from '../config/redis';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Check if token is in Redis (for logout functionality)
    const cachedToken = await cache.get(`oauth:token:${token}`);
    if (!cachedToken) {
      throw new UnauthorizedError('Token invalid or expired');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true, company: true },
    });

    if (!user || user.is_active === 'false') {
      throw new UnauthorizedError('User not found or inactive');
    }

    if (user.company_id !== payload.companyId) {
      throw new UnauthorizedError('Company mismatch');
    }

    req.user = {
      ...payload,
      roleId: user.role_id || undefined,
      isAdmin: user.is_admin === 'true',
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      sendError(res, error.message, error.code, error.statusCode);
      return;
    }
    sendError(res, 'Authentication failed', 'AUTH_ERROR', 401);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 'AUTH_ERROR', 401);
    return;
  }

  if (!req.user.isAdmin) {
    sendError(res, 'Admin access required', 'FORBIDDEN', 403);
    return;
  }

  next();
};

export const requireRole = (roleId: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 'AUTH_ERROR', 401);
      return;
    }

    if (req.user.isAdmin) {
      next();
      return;
    }

    if (req.user.roleId !== roleId) {
      sendError(res, 'Insufficient permissions', 'FORBIDDEN', 403);
      return;
    }

    next();
  };
};

export const requirePermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 'AUTH_ERROR', 401);
        return;
      }

      if (req.user.isAdmin) {
        next();
        return;
      }

      // Check cached permissions
      const cacheKey = `permissions:${req.user.userId}:${req.user.roleId}`;
      let permissions = await cache.get<string[]>(cacheKey);

      if (!permissions) {
        // Fetch from database
        const role = await prisma.role.findUnique({
          where: { id: req.user.roleId! },
          include: { permissions: true },
        });

        if (!role) {
          sendError(res, 'Role not found', 'NOT_FOUND', 404);
          return;
        }

        permissions = role.permissions.map((p) => p.name);

        // Cache permissions
        const { REDIS_TTL_PERMISSIONS } = require('../config/env').config;
        await cache.set(cacheKey, permissions, REDIS_TTL_PERMISSIONS);
      }

      if (!permissions.includes(permissionName)) {
        sendError(res, 'Insufficient permissions', 'FORBIDDEN', 403);
        return;
      }

      next();
    } catch (error) {
      sendError(res, 'Permission check failed', 'PERMISSION_ERROR', 500);
    }
  };
};

