import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcementService';
import { sendSuccess, sendPaginated } from '../utils/response';

const announcementService = new AnnouncementService();

export class AnnouncementController {
  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await announcementService.getAnnouncements(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getAnnouncementById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const announcement = await announcementService.getAnnouncementById(id, req.user.companyId);
      return sendSuccess(res, announcement);
    } catch (error: any) {
      return next(error);
    }
  }

  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const announcement = await announcementService.createAnnouncement(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, announcement, 'Announcement created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const announcement = await announcementService.updateAnnouncement(
        id,
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, announcement, 'Announcement updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      await announcementService.deleteAnnouncement(id, req.user.companyId);
      return sendSuccess(res, null, 'Announcement deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

