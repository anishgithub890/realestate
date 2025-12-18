import { Router } from 'express';
import { PropertyViewingController } from '../controllers/propertyViewingController';
import { authenticate } from '../middleware/auth';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const propertyViewingController = new PropertyViewingController();

router.use(authenticate);

router.get('/', propertyViewingController.getViewings.bind(propertyViewingController));
router.get('/:id', validate(validateId), propertyViewingController.getViewingById.bind(propertyViewingController));
router.post('/', propertyViewingController.createViewing.bind(propertyViewingController));
router.put('/:id', validate(validateId), propertyViewingController.updateViewing.bind(propertyViewingController));
router.put('/:id/status', validate(validateId), propertyViewingController.updateViewingStatus.bind(propertyViewingController));
router.delete('/:id', validate(validateId), propertyViewingController.deleteViewing.bind(propertyViewingController));
router.get('/units/:unitId', validate(validateId), propertyViewingController.getUnitViewings.bind(propertyViewingController));

export default router;

