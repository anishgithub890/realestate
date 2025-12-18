import { Router } from 'express';
import { BrokerController } from '../controllers/brokerController';
import { authenticate } from '../middleware/auth';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const brokerController = new BrokerController();

router.use(authenticate);

router.get('/', brokerController.getBrokers.bind(brokerController));
router.get('/:id', validate(validateId), brokerController.getBrokerById.bind(brokerController));
router.get('/:id/stats', validate(validateId), brokerController.getBrokerStats.bind(brokerController));
router.post('/', brokerController.createBroker.bind(brokerController));
router.put('/:id', validate(validateId), brokerController.updateBroker.bind(brokerController));
router.delete('/:id', validate(validateId), brokerController.deleteBroker.bind(brokerController));

export default router;

