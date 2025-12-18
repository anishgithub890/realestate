import { Request, Response, NextFunction } from 'express';
import {
  PropertyFavoritesService,
  PropertyInspectionService,
  PropertyValuationService,
  PropertyInsuranceService,
  PropertyMaintenanceHistoryService,
  PropertyNotificationService,
  PropertyAnalyticsService,
} from '../services/propertyAdvancedService';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';
import { validate, validateId } from '../middleware/validator';

const favoritesService = new PropertyFavoritesService();
const inspectionService = new PropertyInspectionService();
const valuationService = new PropertyValuationService();
const insuranceService = new PropertyInsuranceService();
const maintenanceService = new PropertyMaintenanceHistoryService();
const notificationService = new PropertyNotificationService();
const analyticsService = new PropertyAnalyticsService();

export class PropertyAdvancedController {
  // Favorites
  async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const { unit_id, lead_id, email, notes } = req.body;
      const favorite = await favoritesService.addFavorite(
        unit_id,
        req.user.userId,
        lead_id,
        email,
        notes,
        req.user.companyId
      );
      sendSuccess(res, favorite, 'Added to favorites', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const { lead_id } = req.body;
      const result = await favoritesService.removeFavorite(
        unitId,
        req.user.userId,
        lead_id,
        req.user.companyId
      );
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getUserFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await favoritesService.getUserFavorites(req.user.userId, req.user.companyId, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getLeadFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const leadId = parseInt(req.params.leadId);
      const favorites = await favoritesService.getLeadFavorites(leadId, req.user.companyId);
      sendSuccess(res, favorites);
    } catch (error: any) {
      next(error);
    }
  }

  // Inspections
  async getInspections(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await inspectionService.getInspections(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async createInspection(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const inspection = await inspectionService.createInspection(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, inspection, 'Inspection created', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitInspections(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const inspections = await inspectionService.getUnitInspections(unitId, req.user.companyId);
      sendSuccess(res, inspections);
    } catch (error: any) {
      next(error);
    }
  }

  // Valuations
  async getValuations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await valuationService.getValuations(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async createValuation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const valuation = await valuationService.createValuation(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, valuation, 'Valuation created', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitValuations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const valuations = await valuationService.getUnitValuations(unitId, req.user.companyId);
      sendSuccess(res, valuations);
    } catch (error: any) {
      next(error);
    }
  }

  // Insurance
  async getInsurances(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await insuranceService.getInsurances(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async createInsurance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const insurance = await insuranceService.createInsurance(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, insurance, 'Insurance created', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitInsurances(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const insurances = await insuranceService.getUnitInsurances(unitId, req.user.companyId);
      sendSuccess(res, insurances);
    } catch (error: any) {
      next(error);
    }
  }

  // Maintenance History
  async getMaintenanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await maintenanceService.getMaintenanceHistory(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async createMaintenanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const history = await maintenanceService.createMaintenanceHistory(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, history, 'Maintenance record created', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitMaintenanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const history = await maintenanceService.getUnitMaintenanceHistory(unitId, req.user.companyId);
      sendSuccess(res, history);
    } catch (error: any) {
      next(error);
    }
  }

  // Notifications
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await notificationService.getNotifications(req.user.userId, req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const notification = await notificationService.markAsRead(id, req.user.userId, req.user.companyId);
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error: any) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await notificationService.markAllAsRead(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await notificationService.getUnreadCount(req.user.userId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  // Analytics
  async trackView(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const result = await analyticsService.trackView(unitId, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : new Date();
      const result = await analyticsService.getUnitAnalytics(unitId, req.user.companyId, dateFrom, dateTo);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async trackMetric(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const metric = req.params.metric as 'favorites' | 'inquiries' | 'viewings' | 'offers';
      const result = await analyticsService.incrementMetric(unitId, metric, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}

