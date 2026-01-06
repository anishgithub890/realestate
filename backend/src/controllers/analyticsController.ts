import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { sendSuccess, sendPaginated } from '../utils/response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getLeadSourcePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const performance = await analyticsService.getLeadSourcePerformance(
        req.user.companyId,
        dateFrom,
        dateTo
      );

      return sendSuccess(res, performance);
    } catch (error: any) {
      return next(error);
    }
  }

  async getConversionFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const funnel = await analyticsService.getConversionFunnel(
        req.user.companyId,
        dateFrom,
        dateTo
      );

      return sendSuccess(res, funnel);
    } catch (error: any) {
      return next(error);
    }
  }

  async calculateROI(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const campaignId = parseInt(req.params.campaignId);
      const roi = await analyticsService.calculateROI(campaignId, req.user.companyId);

      return sendSuccess(res, roi);
    } catch (error: any) {
      return next(error);
    }
  }

  async getRealTimeDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const dashboard = await analyticsService.getRealTimeDashboard(req.user.companyId);

      return sendSuccess(res, dashboard);
    } catch (error: any) {
      return next(error);
    }
  }

  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { report_type } = req.params;
      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const report = await analyticsService.generateReport(
        report_type,
        req.user.companyId,
        dateFrom,
        dateTo
      );

      return sendSuccess(res, report);
    } catch (error: any) {
      return next(error);
    }
  }

  async getAdCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await analyticsService.getAdCampaigns(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createAdCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const campaign = await analyticsService.createAdCampaign(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateAdCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const campaign = await analyticsService.updateAdCampaign(id, req.body, req.user.companyId);
      return sendSuccess(res, campaign, 'Campaign updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteAdCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await analyticsService.deleteAdCampaign(id, req.user.companyId);
      return sendSuccess(res, result, 'Campaign deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

