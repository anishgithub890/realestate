import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

// Real-time dashboard
router.get(
  '/dashboard',
  validate,
  analyticsController.getRealTimeDashboard.bind(analyticsController)
);

// Lead source performance
router.get(
  '/lead-source-performance',
  validate,
  analyticsController.getLeadSourcePerformance.bind(analyticsController)
);

// Conversion funnel
router.get(
  '/conversion-funnel',
  validate,
  analyticsController.getConversionFunnel.bind(analyticsController)
);

// Generate report
router.get(
  '/reports/:report_type',
  validate,
  analyticsController.generateReport.bind(analyticsController)
);

// ROI calculation
router.get(
  '/campaigns/:campaignId/roi',
  validateId,
  validate,
  analyticsController.calculateROI.bind(analyticsController)
);

// Ad Campaigns
router.get(
  '/campaigns',
  validatePagination,
  validate,
  analyticsController.getAdCampaigns.bind(analyticsController)
);

router.post(
  '/campaigns',
  validate,
  analyticsController.createAdCampaign.bind(analyticsController)
);

router.put(
  '/campaigns/:id',
  validateId,
  validate,
  analyticsController.updateAdCampaign.bind(analyticsController)
);

router.delete(
  '/campaigns/:id',
  validateId,
  validate,
  analyticsController.deleteAdCampaign.bind(analyticsController)
);

export default router;

