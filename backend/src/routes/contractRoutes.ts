import { Router } from 'express';
import { ContractController } from '../controllers/contractController';
import { authenticate } from '../middleware/auth';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const contractController = new ContractController();

router.use(authenticate);

// Rental Contract routes
router.get('/rental-contracts', contractController.getRentalContracts.bind(contractController));
router.get('/rental-contracts/:id', validate(validateId), contractController.getRentalContractById.bind(contractController));
router.post('/rental-contracts', contractController.createRentalContract.bind(contractController));
router.put('/rental-contracts/:id', validate(validateId), contractController.updateRentalContract.bind(contractController));
router.post('/rental-contracts/:id/renew', validate(validateId), contractController.renewRentalContract.bind(contractController));

// Sales Contract routes
router.get('/sales-contracts', contractController.getSalesContracts.bind(contractController));
router.get('/sales-contracts/:id', validate(validateId), contractController.getSalesContractById.bind(contractController));
router.post('/sales-contracts', contractController.createSalesContract.bind(contractController));
router.put('/sales-contracts/:id', validate(validateId), contractController.updateSalesContract.bind(contractController));

// Handover routes
router.post('/handovers', contractController.createHandover.bind(contractController));

export default router;

