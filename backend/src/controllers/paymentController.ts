import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { sendSuccess, sendPaginated } from '../utils/response';

const paymentService = new PaymentService();

export class PaymentController {
  async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await paymentService.getPayments(
        req.user.companyId,
        req.query,
        req.query
      );

      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id);
      const payment = await paymentService.getPaymentById(id, req.user.companyId);
      sendSuccess(res, payment);
    } catch (error: any) {
      next(error);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const payment = await paymentService.createPayment(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, payment, 'Payment created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id);
      const payment = await paymentService.updatePayment(id, req.body, req.user.companyId);
      sendSuccess(res, payment, 'Payment updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deletePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id);
      const result = await paymentService.deletePayment(id, req.user.companyId);
      sendSuccess(res, result, 'Payment deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getPaymentUnderOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const options = await paymentService.getPaymentUnderOptions(req.user.companyId);
      sendSuccess(res, options);
    } catch (error: any) {
      next(error);
    }
  }
}

