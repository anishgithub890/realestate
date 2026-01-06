import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/leadService';
import { sendSuccess, sendPaginated } from '../utils/response';

const leadService = new LeadService();

export class LeadController {
  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await leadService.getLeads(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const lead = await leadService.getLeadById(id, req.user.companyId);
      return sendSuccess(res, lead);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const lead = await leadService.createLead(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const lead = await leadService.updateLead(id, req.body, req.user.companyId);
      return sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await leadService.deleteLead(id, req.user.companyId);
      return sendSuccess(res, result, 'Lead deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async assignLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const leadId = parseInt(req.params.id);
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'user_id is required',
        });
      }

      const lead = await leadService.assignLead(
        leadId,
        user_id,
        req.user.companyId
      );
      return sendSuccess(res, lead, 'Lead assigned successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getLeadStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const stats = await leadService.getLeadStats(req.user.companyId, req.query);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return next(error);
    }
  }
}

