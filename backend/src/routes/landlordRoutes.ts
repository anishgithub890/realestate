import { Router } from 'express';
import { LandlordController } from '../controllers/landlordController';
import { authenticate } from '../middleware/auth';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const landlordController = new LandlordController();

router.use(authenticate);

router.get('/', landlordController.getLandlords.bind(landlordController));
router.get('/:id', validate(validateId), landlordController.getLandlordById.bind(landlordController));
router.post('/', landlordController.createLandlord.bind(landlordController));
router.put('/:id', validate(validateId), landlordController.updateLandlord.bind(landlordController));
router.delete('/:id', validate(validateId), landlordController.deleteLandlord.bind(landlordController));

router.get('/:id/kyc', validate(validateId), landlordController.getLandlordKyc.bind(landlordController));
router.get('/:id/units', validate(validateId), landlordController.getLandlordUnits.bind(landlordController));

export default router;

