import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from '../services/complaintService';
import { sendSuccess, sendPaginated } from '../utils/response';

const complaintService = new ComplaintService();

export class ComplaintController {
  async getComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await complaintService.getComplaints(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const complaint = await complaintService.getComplaintById(id, req.user.companyId);
      return sendSuccess(res, complaint);
    } catch (error: any) {
      return next(error);
    }
  }

  async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const complaint = await complaintService.createComplaint(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, complaint, 'Complaint created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const complaint = await complaintService.updateComplaint(id, req.body, req.user.companyId);
      return sendSuccess(res, complaint, 'Complaint updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      await complaintService.deleteComplaint(id, req.user.companyId);
      return sendSuccess(res, null, 'Complaint deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

