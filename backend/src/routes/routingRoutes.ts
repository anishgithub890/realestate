import { Router } from 'express';
import { RoutingController } from '../controllers/routingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const routingController = new RoutingController();

// All routes require authentication
router.use(authenticate);

// Auto-route a lead
router.post(
  '/leads/:leadId/route',
  validateId,
  validate,
  routingController.autoRouteLead.bind(routingController)
);

// Routing Rules
router.get(
  '/rules',
  validatePagination,
  validate,
  routingController.getRoutingRules.bind(routingController)
);

router.get(
  '/rules/:id',
  validateId,
  validate,
  routingController.getRoutingRuleById.bind(routingController)
);

router.post(
  '/rules',
  validate,
  routingController.createRoutingRule.bind(routingController)
);

router.put(
  '/rules/:id',
  validateId,
  validate,
  routingController.updateRoutingRule.bind(routingController)
);

router.delete(
  '/rules/:id',
  validateId,
  validate,
  routingController.deleteRoutingRule.bind(routingController)
);

// Pipelines
router.get(
  '/pipelines',
  validatePagination,
  validate,
  routingController.getPipelines.bind(routingController)
);

router.get(
  '/pipelines/:id',
  validateId,
  validate,
  routingController.getPipelineById.bind(routingController)
);

router.post(
  '/pipelines',
  validate,
  routingController.createPipeline.bind(routingController)
);

router.put(
  '/pipelines/:id',
  validateId,
  validate,
  routingController.updatePipeline.bind(routingController)
);

router.delete(
  '/pipelines/:id',
  validateId,
  validate,
  routingController.deletePipeline.bind(routingController)
);

export default router;

