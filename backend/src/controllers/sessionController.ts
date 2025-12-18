import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/sessionService';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';

const sessionService = new SessionService();

export class SessionController {
  async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await sessionService.getUserSessions(
        req.user.userId,
        req.user.companyId,
        req.query
      );
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { session_token } = req.params;
      const result = await sessionService.revokeSession(
        session_token,
        req.user.userId,
        req.user.companyId
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async revokeAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const authHeader = req.headers.authorization;
      const currentSessionToken = authHeader?.substring(7);

      const result = await sessionService.revokeAllSessions(
        req.user.userId,
        req.user.companyId,
        currentSessionToken
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getSessionStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await sessionService.getSessionStats(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}

