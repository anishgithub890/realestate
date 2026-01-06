import { Router } from 'express';
import { ComplaintController } from '../controllers/complaintController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const complaintController = new ComplaintController();

router.use(authenticate);

router.get(
  '/',
  validatePagination,
  validate,
  complaintController.getComplaints.bind(complaintController)
);

router.get(
  '/:id',
  validateId,
  validate,
  complaintController.getComplaintById.bind(complaintController)
);

router.post(
  '/',
  validate,
  complaintController.createComplaint.bind(complaintController)
);

router.put(
  '/:id',
  validateId,
  validate,
  complaintController.updateComplaint.bind(complaintController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  complaintController.deleteComplaint.bind(complaintController)
);

export default router;

