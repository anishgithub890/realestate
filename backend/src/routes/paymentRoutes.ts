import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate, validatePaymentCreate, validatePaymentUpdate, validateId } from '../middleware/validator';

const router = Router();
const paymentController = new PaymentController();

// All routes require authentication
router.use(authenticate);

// Payment routes
router.get('/', paymentController.getPayments.bind(paymentController));
router.get('/payment-under-options', paymentController.getPaymentUnderOptions.bind(paymentController));
router.get('/:id', validate(validateId), paymentController.getPaymentById.bind(paymentController));
router.post('/', validate(validatePaymentCreate), paymentController.createPayment.bind(paymentController));
router.put('/:id', validate([...validateId, ...validatePaymentUpdate]), paymentController.updatePayment.bind(paymentController));
router.delete('/:id', validate(validateId), paymentController.deletePayment.bind(paymentController));

export default router;

