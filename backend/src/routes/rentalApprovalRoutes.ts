import { Router } from 'express';
import { RentalApprovalController } from '../controllers/rentalApprovalController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const rentalApprovalController = new RentalApprovalController();

router.use(authenticate);

router.get(
  '/',
  validatePagination,
  validate,
  rentalApprovalController.getRentalApprovals.bind(rentalApprovalController)
);

router.get(
  '/:id',
  validateId,
  validate,
  rentalApprovalController.getRentalApprovalById.bind(rentalApprovalController)
);

router.post(
  '/',
  validate,
  rentalApprovalController.createRentalApproval.bind(rentalApprovalController)
);

router.put(
  '/:id',
  validateId,
  validate,
  rentalApprovalController.updateRentalApproval.bind(rentalApprovalController)
);

router.post(
  '/:id/approve',
  validateId,
  validate,
  rentalApprovalController.approveRentalApproval.bind(rentalApprovalController)
);

router.post(
  '/:id/reject',
  validateId,
  validate,
  rentalApprovalController.rejectRentalApproval.bind(rentalApprovalController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  rentalApprovalController.deleteRentalApproval.bind(rentalApprovalController)
);

export default router;

