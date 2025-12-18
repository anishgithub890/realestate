import { Request, Response, NextFunction } from 'express';
import { LandlordService } from '../services/landlordService';
import { sendSuccess, sendPaginated } from '../utils/response';

const landlordService = new LandlordService();

export class LandlordController {
  async getLandlords(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await landlordService.getLandlords(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getLandlordById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const landlord = await landlordService.getLandlordById(id, req.user.companyId);
      sendSuccess(res, landlord);
    } catch (error: any) {
      next(error);
    }
  }

  async createLandlord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const landlord = await landlordService.createLandlord(req.body, req.user.companyId);
      sendSuccess(res, landlord, 'Landlord created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateLandlord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const landlord = await landlordService.updateLandlord(id, req.body, req.user.companyId);
      sendSuccess(res, landlord, 'Landlord updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteLandlord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const result = await landlordService.deleteLandlord(id, req.user.companyId);
      sendSuccess(res, result, 'Landlord deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getLandlordKyc(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const documents = await landlordService.getLandlordKyc(id, req.user.companyId);
      sendSuccess(res, documents);
    } catch (error: any) {
      next(error);
    }
  }

  async getLandlordUnits(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const units = await landlordService.getLandlordUnits(id, req.user.companyId);
      sendSuccess(res, units);
    } catch (error: any) {
      next(error);
    }
  }
}

