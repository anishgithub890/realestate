import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, company_id, two_factor_token } = req.body;
      const result = await authService.login(email, password, company_id, two_factor_token);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      next(error);
    }
  }

  async oauth2Token(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { grant_type, username, password, client_id, client_secret, company_id, two_factor_token } = req.body;
      const result = await authService.oauth2Token(
        grant_type,
        username,
        password,
        client_id,
        client_secret,
        company_id,
        two_factor_token
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, 'No token provided', 'AUTH_ERROR', 401);
        return;
      }

      const token = authHeader.substring(7);
      const result = await authService.logout(token);
      sendSuccess(res, result, 'Logout successful');
    } catch (error: any) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        sendError(res, 'Refresh token is required', 'VALIDATION_ERROR', 400);
        return;
      }

      const result = await authService.refreshToken(refresh_token);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        return;
      }

      const result = await authService.getCurrentUser(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        return;
      }

      const result = await authService.getCompanies(req.user.userId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async selectCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        return;
      }

      const { company_id } = req.body;
      if (!company_id) {
        sendError(res, 'Company ID is required', 'VALIDATION_ERROR', 400);
        return;
      }

      const result = await authService.selectCompany(req.user.userId, company_id);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, 'Email is required', 'VALIDATION_ERROR', 400);
        return;
      }

      const result = await authService.forgotPassword(email);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        sendError(res, 'Token and password are required', 'VALIDATION_ERROR', 400);
        return;
      }

      if (password.length < 6) {
        sendError(res, 'Password must be at least 6 characters', 'VALIDATION_ERROR', 400);
        return;
      }

      const result = await authService.resetPassword(token, password);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}

