import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/requestService';
import { sendSuccess, sendPaginated } from '../utils/response';

const requestService = new RequestService();

export class RequestController {
  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await requestService.getRequests(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const request = await requestService.getRequestById(id, req.user.companyId);
      return sendSuccess(res, request);
    } catch (error: any) {
      return next(error);
    }
  }

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const request = await requestService.createRequest(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, request, 'Request created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateRequest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const request = await requestService.updateRequest(id, req.body, req.user.companyId);
      return sendSuccess(res, request, 'Request updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteRequest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      await requestService.deleteRequest(id, req.user.companyId);
      return sendSuccess(res, null, 'Request deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

