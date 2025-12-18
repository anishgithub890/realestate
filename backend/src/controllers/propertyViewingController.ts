import { Request, Response, NextFunction } from 'express';
import { PropertyViewingService } from '../services/propertyViewingService';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';

const propertyViewingService = new PropertyViewingService();

export class PropertyViewingController {
  async getViewings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await propertyViewingService.getViewings(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getViewingById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const viewing = await propertyViewingService.getViewingById(id, req.user.companyId);
      sendSuccess(res, viewing);
    } catch (error: any) {
      next(error);
    }
  }

  async createViewing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const viewing = await propertyViewingService.createViewing(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, viewing, 'Viewing scheduled successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateViewing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const viewing = await propertyViewingService.updateViewing(id, req.body, req.user.companyId);
      sendSuccess(res, viewing, 'Viewing updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteViewing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const result = await propertyViewingService.deleteViewing(id, req.user.companyId);
      sendSuccess(res, result, 'Viewing deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async updateViewingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const { status, feedback, rating } = req.body;

      if (!status) {
        return sendError(res, 'Status is required', 'VALIDATION_ERROR', 400);
      }

      const viewing = await propertyViewingService.updateViewingStatus(
        id,
        status,
        feedback,
        rating,
        req.user.companyId
      );
      sendSuccess(res, viewing, 'Viewing status updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitViewings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const unitId = parseInt(req.params.unitId);
      const viewings = await propertyViewingService.getUnitViewings(unitId, req.user.companyId);
      sendSuccess(res, viewings);
    } catch (error: any) {
      next(error);
    }
  }
}

