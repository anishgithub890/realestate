import { Request, Response, NextFunction } from 'express';
import { MicrositeService } from '../services/micrositeService';
import { sendSuccess, sendPaginated } from '../utils/response';

const micrositeService = new MicrositeService();

export class MicrositeController {
  async getMicrosites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await micrositeService.getMicrosites(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getMicrositeById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const microsite = await micrositeService.getMicrositeById(id, req.user.companyId);
      return sendSuccess(res, microsite);
    } catch (error: any) {
      return next(error);
    }
  }

  // Public endpoint - no authentication required
  async getMicrositeBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const microsite = await micrositeService.getMicrositeBySlug(slug);
      return sendSuccess(res, microsite);
    } catch (error: any) {
      return next(error);
    }
  }

  // Public endpoint - render microsite HTML
  async renderMicrosite(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const html = await micrositeService.renderMicrosite(slug);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error: any) {
      return next(error);
    }
  }

  async createMicrosite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const microsite = await micrositeService.createMicrosite(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, microsite, 'Microsite created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateMicrosite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const microsite = await micrositeService.updateMicrosite(id, req.body, req.user.companyId);
      return sendSuccess(res, microsite, 'Microsite updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteMicrosite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await micrositeService.deleteMicrosite(id, req.user.companyId);
      return sendSuccess(res, result, 'Microsite deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getMicrositeTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await micrositeService.getMicrositeTemplates(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getMicrositeTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const template = await micrositeService.getMicrositeTemplateById(id, req.user.companyId);
      return sendSuccess(res, template);
    } catch (error: any) {
      return next(error);
    }
  }

  async createMicrositeTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const template = await micrositeService.createMicrositeTemplate(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, template, 'Microsite template created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateMicrositeTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const template = await micrositeService.updateMicrositeTemplate(id, req.body, req.user.companyId);
      return sendSuccess(res, template, 'Microsite template updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteMicrositeTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await micrositeService.deleteMicrositeTemplate(id, req.user.companyId);
      return sendSuccess(res, result, 'Microsite template deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

