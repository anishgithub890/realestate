import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from '../services/integrationService';
import { sendSuccess, sendPaginated } from '../utils/response';

const integrationService = new IntegrationService();

export class IntegrationController {
  async upsertIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const integration = await integrationService.upsertIntegration(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, integration, 'Integration saved successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await integrationService.getIntegrations(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getIntegrationById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const integration = await integrationService.getIntegrationById(id, req.user.companyId);
      return sendSuccess(res, integration);
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await integrationService.deleteIntegration(id, req.user.companyId);
      return sendSuccess(res, result, 'Integration deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async syncGoogleAdsLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await integrationService.syncGoogleAdsLeads(req.user.companyId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return next(error);
    }
  }

  async syncFacebookAdsLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await integrationService.syncFacebookAdsLeads(req.user.companyId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return next(error);
    }
  }

  async syncPortalLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { portalName } = req.params;
      const result = await integrationService.syncPortalLeads(portalName, req.user.companyId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return next(error);
    }
  }

  async getWebhooks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await integrationService.getWebhooks(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getWebhookById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const webhook = await integrationService.getWebhookById(id, req.user.companyId);
      return sendSuccess(res, webhook);
    } catch (error: any) {
      return next(error);
    }
  }

  async createWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const webhook = await integrationService.createWebhook(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, webhook, 'Webhook created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const webhook = await integrationService.updateWebhook(id, req.body, req.user.companyId);
      return sendSuccess(res, webhook, 'Webhook updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await integrationService.deleteWebhook(id, req.user.companyId);
      return sendSuccess(res, result, 'Webhook deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Public webhook endpoint (no authentication required)
  async receiveWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookId = parseInt(req.params.webhookId);
      const result = await integrationService.receiveWebhook(
        webhookId,
        req.body,
        req.headers
      );
      return sendSuccess(res, result, 'Webhook processed successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

