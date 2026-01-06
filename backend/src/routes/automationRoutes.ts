import { Router } from 'express';
import { AutomationController } from '../controllers/automationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const automationController = new AutomationController();

// All routes require authentication
router.use(authenticate);

// Process automation rules for a lead
router.post(
  '/leads/:leadId/process',
  validateId,
  validate,
  automationController.processAutomationRules.bind(automationController)
);

// Automation Rules
router.get(
  '/rules',
  validatePagination,
  validate,
  automationController.getAutomationRules.bind(automationController)
);

router.get(
  '/rules/:id',
  validateId,
  validate,
  automationController.getAutomationRuleById.bind(automationController)
);

router.post(
  '/rules',
  validate,
  automationController.createAutomationRule.bind(automationController)
);

router.put(
  '/rules/:id',
  validateId,
  validate,
  automationController.updateAutomationRule.bind(automationController)
);

router.delete(
  '/rules/:id',
  validateId,
  validate,
  automationController.deleteAutomationRule.bind(automationController)
);

// Message Templates
router.get(
  '/templates',
  validatePagination,
  validate,
  automationController.getMessageTemplates.bind(automationController)
);

router.get(
  '/templates/:id',
  validateId,
  validate,
  automationController.getMessageTemplateById.bind(automationController)
);

router.post(
  '/templates',
  validate,
  automationController.createMessageTemplate.bind(automationController)
);

router.put(
  '/templates/:id',
  validateId,
  validate,
  automationController.updateMessageTemplate.bind(automationController)
);

router.delete(
  '/templates/:id',
  validateId,
  validate,
  automationController.deleteMessageTemplate.bind(automationController)
);

export default router;

