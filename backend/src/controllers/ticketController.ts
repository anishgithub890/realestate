import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticketService';
import { sendSuccess, sendPaginated } from '../utils/response';

const ticketService = new TicketService();

export class TicketController {
  async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ticketService.getTickets(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const ticket = await ticketService.getTicketById(id, req.user.companyId);
      return sendSuccess(res, ticket);
    } catch (error: any) {
      return next(error);
    }
  }

  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const ticket = await ticketService.createTicket(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, ticket, 'Ticket created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const ticket = await ticketService.updateTicket(id, req.body, req.user.companyId);
      return sendSuccess(res, ticket, 'Ticket updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      await ticketService.deleteTicket(id, req.user.companyId);
      return sendSuccess(res, null, 'Ticket deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

