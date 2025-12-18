import { Router } from 'express';
import { TenantController } from '../controllers/tenantController';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const tenantController = new TenantController();

router.use(authenticate);

router.get('/', tenantController.getTenants.bind(tenantController));
router.get('/:id', validate(validateId), tenantController.getTenantById.bind(tenantController));
router.post('/', tenantController.createTenant.bind(tenantController));
router.put('/:id', validate(validateId), tenantController.updateTenant.bind(tenantController));
router.delete('/:id', validate(validateId), tenantController.deleteTenant.bind(tenantController));

// KYC routes
router.get('/:id/kyc', validate(validateId), tenantController.getTenantKyc.bind(tenantController));
router.post('/:id/kyc', validate(validateId), uploadSingle('document'), tenantController.uploadKycDocument.bind(tenantController));

// Contract and unit routes
router.get('/:id/contracts', validate(validateId), tenantController.getTenantContracts.bind(tenantController));
router.get('/:id/units', validate(validateId), tenantController.getTenantUnits.bind(tenantController));

export default router;

