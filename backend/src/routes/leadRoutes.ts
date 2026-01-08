import { Router } from 'express';
import { LeadController } from '../controllers/leadController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { uploadSingle } from '../middleware/upload';
import {
  validatePagination,
  validateId,
  validateLeadCreate,
  validateLeadUpdate,
} from '../utils/validation';

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(authenticate);

// Get all leads with pagination and filters
router.get(
  '/',
  validatePagination,
  validate,
  leadController.getLeads.bind(leadController)
);

// Get lead statistics
router.get(
  '/stats',
  validate,
  leadController.getLeadStats.bind(leadController)
);

// Get lead by ID
router.get(
  '/:id',
  validateId,
  validate,
  leadController.getLeadById.bind(leadController)
);

// Create new lead
router.post(
  '/',
  validateLeadCreate,
  validate,
  leadController.createLead.bind(leadController)
);

// Update lead
router.put(
  '/:id',
  validateId,
  validateLeadUpdate,
  validate,
  leadController.updateLead.bind(leadController)
);

// Delete lead
router.delete(
  '/:id',
  validateId,
  validate,
  leadController.deleteLead.bind(leadController)
);

// Assign lead to user
router.post(
  '/:id/assign',
  validateId,
  validate,
  leadController.assignLead.bind(leadController)
);

// Bulk upload leads from CSV
router.post(
  '/bulk-upload',
  uploadSingle('file'),
  leadController.bulkUploadLeadsFromCsv.bind(leadController)
);

export default router;

