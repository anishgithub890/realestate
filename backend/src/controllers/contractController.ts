import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contractService';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';

const contractService = new ContractService();

export class ContractController {
  // Rental Contracts
  async getRentalContracts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await contractService.getRentalContracts(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getRentalContractById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const contract = await contractService.getRentalContractById(id, req.user.companyId);
      sendSuccess(res, contract);
    } catch (error: any) {
      next(error);
    }
  }

  async createRentalContract(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const contract = await contractService.createRentalContract(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, contract, 'Rental contract created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateRentalContract(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const contract = await contractService.updateRentalContract(id, req.body, req.user.companyId);
      sendSuccess(res, contract, 'Rental contract updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async renewRentalContract(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const contract = await contractService.renewRentalContract(
        id,
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, contract, 'Contract renewed successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  // Sales Contracts
  async getSalesContracts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const result = await contractService.getSalesContracts(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getSalesContractById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const contract = await contractService.getSalesContractById(id, req.user.companyId);
      sendSuccess(res, contract);
    } catch (error: any) {
      next(error);
    }
  }

  async createSalesContract(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const contract = await contractService.createSalesContract(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      sendSuccess(res, contract, 'Sales contract created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateSalesContract(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const id = parseInt(req.params.id);
      const contract = await contractService.updateSalesContract(id, req.body, req.user.companyId);
      sendSuccess(res, contract, 'Sales contract updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Handover
  async createHandover(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
      const handover = await contractService.createHandover(req.body, req.user.companyId);
      sendSuccess(res, handover, 'Handover created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }
}

