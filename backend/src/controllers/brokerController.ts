import { Request, Response, NextFunction } from 'express';
import { BrokerService } from '../services/brokerService';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';
import { validate, validateId } from '../middleware/validator';

const brokerService = new BrokerService();

export class BrokerController {
  async getBrokers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await brokerService.getBrokers(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getBrokerById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const broker = await brokerService.getBrokerById(id, req.user.companyId);
      sendSuccess(res, broker);
    } catch (error: any) {
      next(error);
    }
  }

  async createBroker(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const broker = await brokerService.createBroker(req.body, req.user.companyId);
      sendSuccess(res, broker, 'Broker created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateBroker(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const broker = await brokerService.updateBroker(id, req.body, req.user.companyId);
      sendSuccess(res, broker, 'Broker updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteBroker(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const result = await brokerService.deleteBroker(id, req.user.companyId);
      sendSuccess(res, result, 'Broker deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getBrokerStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const stats = await brokerService.getBrokerStats(id, req.user.companyId);
      sendSuccess(res, stats);
    } catch (error: any) {
      next(error);
    }
  }
}

