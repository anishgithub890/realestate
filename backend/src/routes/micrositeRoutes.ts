import { Router } from 'express';
import { MicrositeController } from '../controllers/micrositeController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const micrositeController = new MicrositeController();

// Public routes (no authentication)
router.get(
  '/public/:slug',
  validate,
  micrositeController.getMicrositeBySlug.bind(micrositeController)
);

router.get(
  '/public/:slug/render',
  validate,
  micrositeController.renderMicrosite.bind(micrositeController)
);

// Protected routes (require authentication)
router.use(authenticate);

// Microsites
router.get(
  '/',
  validatePagination,
  validate,
  micrositeController.getMicrosites.bind(micrositeController)
);

router.get(
  '/:id',
  validateId,
  validate,
  micrositeController.getMicrositeById.bind(micrositeController)
);

router.post(
  '/',
  validate,
  micrositeController.createMicrosite.bind(micrositeController)
);

router.put(
  '/:id',
  validateId,
  validate,
  micrositeController.updateMicrosite.bind(micrositeController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  micrositeController.deleteMicrosite.bind(micrositeController)
);

// Microsite Templates
router.get(
  '/templates',
  validatePagination,
  validate,
  micrositeController.getMicrositeTemplates.bind(micrositeController)
);

router.get(
  '/templates/:id',
  validateId,
  validate,
  micrositeController.getMicrositeTemplateById.bind(micrositeController)
);

router.post(
  '/templates',
  validate,
  micrositeController.createMicrositeTemplate.bind(micrositeController)
);

router.put(
  '/templates/:id',
  validateId,
  validate,
  micrositeController.updateMicrositeTemplate.bind(micrositeController)
);

router.delete(
  '/templates/:id',
  validateId,
  validate,
  micrositeController.deleteMicrositeTemplate.bind(micrositeController)
);

export default router;

