import { Router } from 'express';
import { IntegrationController } from '../controllers/integrationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const integrationController = new IntegrationController();

// Public webhook endpoint (no authentication)
router.post(
  '/webhooks/:webhookId/receive',
  validate,
  integrationController.receiveWebhook.bind(integrationController)
);

// All other routes require authentication
router.use(authenticate);

// Integrations
router.post(
  '/',
  validate,
  integrationController.upsertIntegration.bind(integrationController)
);

router.get(
  '/',
  validatePagination,
  validate,
  integrationController.getIntegrations.bind(integrationController)
);

router.get(
  '/:id',
  validateId,
  validate,
  integrationController.getIntegrationById.bind(integrationController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  integrationController.deleteIntegration.bind(integrationController)
);

// Sync operations
router.post(
  '/google-ads/sync',
  validate,
  integrationController.syncGoogleAdsLeads.bind(integrationController)
);

router.post(
  '/facebook-ads/sync',
  validate,
  integrationController.syncFacebookAdsLeads.bind(integrationController)
);

router.post(
  '/portals/:portalName/sync',
  validate,
  integrationController.syncPortalLeads.bind(integrationController)
);

// Webhooks
router.get(
  '/webhooks',
  validatePagination,
  validate,
  integrationController.getWebhooks.bind(integrationController)
);

router.get(
  '/webhooks/:id',
  validateId,
  validate,
  integrationController.getWebhookById.bind(integrationController)
);

router.post(
  '/webhooks',
  validate,
  integrationController.createWebhook.bind(integrationController)
);

router.put(
  '/webhooks/:id',
  validateId,
  validate,
  integrationController.updateWebhook.bind(integrationController)
);

router.delete(
  '/webhooks/:id',
  validateId,
  validate,
  integrationController.deleteWebhook.bind(integrationController)
);

export default router;

