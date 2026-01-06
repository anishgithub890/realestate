import { Router } from 'express';
import { RequestController } from '../controllers/requestController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const requestController = new RequestController();

router.use(authenticate);

router.get(
  '/',
  validatePagination,
  validate,
  requestController.getRequests.bind(requestController)
);

router.get(
  '/:id',
  validateId,
  validate,
  requestController.getRequestById.bind(requestController)
);

router.post(
  '/',
  validate,
  requestController.createRequest.bind(requestController)
);

router.put(
  '/:id',
  validateId,
  validate,
  requestController.updateRequest.bind(requestController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  requestController.deleteRequest.bind(requestController)
);

export default router;

