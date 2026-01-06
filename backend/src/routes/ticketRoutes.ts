import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const ticketController = new TicketController();

router.use(authenticate);

router.get(
  '/',
  validatePagination,
  validate,
  ticketController.getTickets.bind(ticketController)
);

router.get(
  '/:id',
  validateId,
  validate,
  ticketController.getTicketById.bind(ticketController)
);

router.post(
  '/',
  validate,
  ticketController.createTicket.bind(ticketController)
);

router.put(
  '/:id',
  validateId,
  validate,
  ticketController.updateTicket.bind(ticketController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  ticketController.deleteTicket.bind(ticketController)
);

export default router;

