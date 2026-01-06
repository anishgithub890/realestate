import { Request, Response, NextFunction } from 'express';
import { AutomationService } from '../services/automationService';
import { sendSuccess, sendPaginated } from '../utils/response';

const automationService = new AutomationService();

export class AutomationController {
  async processAutomationRules(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const leadId = parseInt(req.params.leadId);
      const { trigger_type } = req.body;

      if (!trigger_type) {
        return res.status(400).json({
          success: false,
          error: 'trigger_type is required',
        });
      }

      await automationService.processAutomationRules(
        leadId,
        trigger_type,
        req.user.companyId
      );

      return sendSuccess(res, { message: 'Automation rules processed' });
    } catch (error: any) {
      return next(error);
    }
  }

  async getAutomationRules(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await automationService.getAutomationRules(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getAutomationRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const rule = await automationService.getAutomationRuleById(id, req.user.companyId);
      return sendSuccess(res, rule);
    } catch (error: any) {
      return next(error);
    }
  }

  async createAutomationRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const rule = await automationService.createAutomationRule(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, rule, 'Automation rule created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateAutomationRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const rule = await automationService.updateAutomationRule(id, req.body, req.user.companyId);
      return sendSuccess(res, rule, 'Automation rule updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteAutomationRule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await automationService.deleteAutomationRule(id, req.user.companyId);
      return sendSuccess(res, result, 'Automation rule deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getMessageTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await automationService.getMessageTemplates(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getMessageTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const template = await automationService.getMessageTemplateById(id, req.user.companyId);
      return sendSuccess(res, template);
    } catch (error: any) {
      return next(error);
    }
  }

  async createMessageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const template = await automationService.createMessageTemplate(
        req.body,
        req.user.companyId
      );
      return sendSuccess(res, template, 'Message template created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateMessageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const template = await automationService.updateMessageTemplate(id, req.body, req.user.companyId);
      return sendSuccess(res, template, 'Message template updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteMessageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await automationService.deleteMessageTemplate(id, req.user.companyId);
      return sendSuccess(res, result, 'Message template deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

