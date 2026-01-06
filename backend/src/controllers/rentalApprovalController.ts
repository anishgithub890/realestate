import { Request, Response, NextFunction } from 'express';
import { RentalApprovalService } from '../services/rentalApprovalService';
import { sendSuccess, sendPaginated } from '../utils/response';

const rentalApprovalService = new RentalApprovalService();

export class RentalApprovalController {
  async getRentalApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await rentalApprovalService.getRentalApprovals(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getRentalApprovalById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const approval = await rentalApprovalService.getRentalApprovalById(id, req.user.companyId);
      return sendSuccess(res, approval);
    } catch (error: any) {
      return next(error);
    }
  }

  async createRentalApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const approval = await rentalApprovalService.createRentalApproval(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, approval, 'Rental approval request created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateRentalApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const approval = await rentalApprovalService.updateRentalApproval(
        id,
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, approval, 'Rental approval updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async approveRentalApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const approval = await rentalApprovalService.approveRentalApproval(
        id,
        req.user.companyId,
        req.user.userId,
        req.body.remarks
      );
      return sendSuccess(res, approval, 'Rental approval approved successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async rejectRentalApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const approval = await rentalApprovalService.rejectRentalApproval(
        id,
        req.user.companyId,
        req.user.userId,
        req.body.remarks
      );
      return sendSuccess(res, approval, 'Rental approval rejected successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteRentalApproval(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      await rentalApprovalService.deleteRentalApproval(id, req.user.companyId);
      return sendSuccess(res, null, 'Rental approval deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

