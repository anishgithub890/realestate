import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/locationService';
import { sendSuccess, sendPaginated } from '../utils/response';

const locationService = new LocationService();

export class LocationController {
  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await locationService.getLocations(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const location = await locationService.getLocationById(id, req.user.companyId);
      return sendSuccess(res, location);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationTree(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parentId = req.query.parent_id as string | undefined;
      const tree = await locationService.getLocationTree(req.user.companyId, parentId);
      return sendSuccess(res, tree);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const location = await locationService.createLocation(req.body, req.user.companyId);
      return sendSuccess(res, location, 'Location created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const location = await locationService.updateLocation(id, req.body, req.user.companyId);
      return sendSuccess(res, location, 'Location updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      await locationService.deleteLocation(id, req.user.companyId);
      return sendSuccess(res, null, 'Location deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationsByLevel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const level = req.params.level;
      const locations = await locationService.getLocationsByLevel(req.user.companyId, level);
      return sendSuccess(res, locations);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationPath(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const path = await locationService.getLocationPath(id, req.user.companyId);
      return sendSuccess(res, path);
    } catch (error: any) {
      return next(error);
    }
  }
}

