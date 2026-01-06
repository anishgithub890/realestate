import { Request, Response, NextFunction } from 'express';
import { RoutingService } from '../services/routingService';
import { sendSuccess, sendPaginated } from '../utils/response';

const routingService = new RoutingService();

export class RoutingController {
  async autoRouteLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const leadId = parseInt(req.params.leadId);
      const lead = await routingService.autoRouteLead(leadId, req.user.companyId);
      return sendSuccess(res, lead, 'Lead routed successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getRoutingRules(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await routingService.getRoutingRules(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getRoutingRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const rule = await routingService.getRoutingRuleById(id, req.user.companyId);
      return sendSuccess(res, rule);
    } catch (error: any) {
      return next(error);
    }
  }

  async createRoutingRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const rule = await routingService.createRoutingRule(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, rule, 'Routing rule created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateRoutingRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const rule = await routingService.updateRoutingRule(id, req.body, req.user.companyId);
      return sendSuccess(res, rule, 'Routing rule updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteRoutingRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await routingService.deleteRoutingRule(id, req.user.companyId);
      return sendSuccess(res, result, 'Routing rule deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getPipelines(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await routingService.getPipelines(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getPipelineById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const pipeline = await routingService.getPipelineById(id, req.user.companyId);
      return sendSuccess(res, pipeline);
    } catch (error: any) {
      return next(error);
    }
  }

  async createPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const pipeline = await routingService.createPipeline(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, pipeline, 'Pipeline created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updatePipeline(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const pipeline = await routingService.updatePipeline(id, req.body, req.user.companyId);
      return sendSuccess(res, pipeline, 'Pipeline updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deletePipeline(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await routingService.deletePipeline(id, req.user.companyId);
      return sendSuccess(res, result, 'Pipeline deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

