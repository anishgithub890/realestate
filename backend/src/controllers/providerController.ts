import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../services/providerService';
import { sendSuccess, sendError } from '../utils/response';

const providerService = new ProviderService();

export class ProviderController {
  async linkProvider(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { provider, provider_account_id, provider_email, provider_name, access_token, refresh_token, expires_at } = req.body;

      if (!provider || !provider_account_id) {
        return sendError(res, 'Provider and provider_account_id are required', 'VALIDATION_ERROR', 400);
      }

      const result = await providerService.linkProvider(
        req.user.userId,
        provider,
        provider_account_id,
        provider_email,
        provider_name,
        access_token,
        refresh_token,
        expires_at ? new Date(expires_at) : undefined
      );
      sendSuccess(res, result, 'Provider linked successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async unlinkProvider(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const { provider } = req.params;
      if (!provider) {
        return sendError(res, 'Provider is required', 'VALIDATION_ERROR', 400);
      }

      const result = await providerService.unlinkProvider(
        req.user.userId,
        req.user.companyId,
        provider
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getUserProviders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      }

      const result = await providerService.getUserProviders(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async signupWithProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        provider,
        provider_account_id,
        email,
        name,
        company_id,
        provider_email,
        provider_name,
        access_token,
        refresh_token,
        expires_at,
      } = req.body;

      if (!provider || !provider_account_id || !email || !name || !company_id) {
        return sendError(
          res,
          'Provider, provider_account_id, email, name, and company_id are required',
          'VALIDATION_ERROR',
          400
        );
      }

      const result = await providerService.signupWithProvider(
        provider,
        provider_account_id,
        email,
        name,
        company_id,
        provider_email,
        provider_name,
        access_token,
        refresh_token,
        expires_at ? new Date(expires_at) : undefined
      );
      sendSuccess(res, result, 'Signup successful', 201);
    } catch (error: any) {
      next(error);
    }
  }
}

