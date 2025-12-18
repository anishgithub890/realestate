import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenantService';
import { sendSuccess, sendPaginated } from '../utils/response';

const tenantService = new TenantService();

export class TenantController {
  async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await tenantService.getTenants(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const tenant = await tenantService.getTenantById(id, req.user.companyId);
      sendSuccess(res, tenant);
    } catch (error: any) {
      next(error);
    }
  }

  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const tenant = await tenantService.createTenant(req.body, req.user.companyId);
      sendSuccess(res, tenant, 'Tenant created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const tenant = await tenantService.updateTenant(id, req.body, req.user.companyId);
      sendSuccess(res, tenant, 'Tenant updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const result = await tenantService.deleteTenant(id, req.user.companyId);
      sendSuccess(res, result, 'Tenant deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async getTenantKyc(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const documents = await tenantService.getTenantKyc(id, req.user.companyId);
      sendSuccess(res, documents);
    } catch (error: any) {
      next(error);
    }
  }

  async uploadKycDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const tenantId = parseInt(req.params.id);
      const { doc_type_id } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'File is required' });
      }

      const document = await tenantService.uploadKycDocument(
        tenantId,
        doc_type_id,
        file.path,
        req.user.companyId
      );
      sendSuccess(res, document, 'Document uploaded successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getTenantContracts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const contracts = await tenantService.getTenantContracts(id, req.user.companyId);
      sendSuccess(res, contracts);
    } catch (error: any) {
      next(error);
    }
  }

  async getTenantUnits(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const units = await tenantService.getTenantUnits(id, req.user.companyId);
      sendSuccess(res, units);
    } catch (error: any) {
      next(error);
    }
  }
}

