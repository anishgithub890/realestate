import { Request, Response, NextFunction } from 'express';
import { TwoFactorService } from '../services/twoFactorService';
import { sendSuccess, sendError } from '../utils/response';

const twoFactorService = new TwoFactorService();

export class TwoFactorController {
  async enable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await twoFactorService.enable2FA(req.user.userId, req.user.companyId);
      sendSuccess(res, result, '2FA setup initiated');
    } catch (error: any) {
      next(error);
    }
  }

  async verifyAndEnable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { token } = req.body;
      if (!token) {
        return sendError(res, 'Token is required', 'VALIDATION_ERROR', 400);
      }

      const result = await twoFactorService.verifyAndEnable2FA(
        req.user.userId,
        req.user.companyId,
        token
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { password } = req.body;
      const result = await twoFactorService.disable2FA(
        req.user.userId,
        req.user.companyId,
        password
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { token, use_backup_code } = req.body;
      if (!token) {
        return sendError(res, 'Token is required', 'VALIDATION_ERROR', 400);
      }

      const result = await twoFactorService.verify2FA(
        req.user.userId,
        token,
        use_backup_code === true
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async regenerateBackupCodes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await twoFactorService.regenerateBackupCodes(
        req.user.userId,
        req.user.companyId
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async get2FAStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await twoFactorService.get2FAStatus(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}

