import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId, validateBuildingCreate, validateBuildingUpdate, validateBuildingId, validateFloorCreate, validateFloorUpdate } from '../utils/validation';

const router = Router();
const propertyController = new PropertyController();

router.use(authenticate);

// Building routes
router.get('/buildings', validatePagination, validate([]), propertyController.getBuildings.bind(propertyController));
router.get('/buildings/:id', validate(validateId), propertyController.getBuildingById.bind(propertyController));
router.post('/buildings', validate(validateBuildingCreate), propertyController.createBuilding.bind(propertyController));
router.put('/buildings/:id', validate([...validateId, ...validateBuildingUpdate]), propertyController.updateBuilding.bind(propertyController));
router.delete('/buildings/:id', validate(validateId), propertyController.deleteBuilding.bind(propertyController));

// Unit routes
router.get('/units', propertyController.getUnits.bind(propertyController));
router.get('/units/available', propertyController.getAvailableUnits.bind(propertyController));
router.get('/units/:id', validate(validateId), propertyController.getUnitById.bind(propertyController));
router.post('/units', propertyController.createUnit.bind(propertyController));
router.put('/units/:id', validate(validateId), propertyController.updateUnit.bind(propertyController));
router.delete('/units/:id', validate(validateId), propertyController.deleteUnit.bind(propertyController));

// Floor routes
router.get('/floors', validatePagination, validate([]), propertyController.getAllFloors.bind(propertyController));
router.get('/buildings/:buildingId/floors', validate(validateBuildingId), propertyController.getFloors.bind(propertyController));
router.get('/floors/:id', validate(validateId), propertyController.getFloorById.bind(propertyController));
router.post('/floors', validate(validateFloorCreate), propertyController.createFloor.bind(propertyController));
router.put('/floors/:id', validate([...validateId, ...validateFloorUpdate]), propertyController.updateFloor.bind(propertyController));
router.delete('/floors/:id', validate(validateId), propertyController.deleteFloor.bind(propertyController));

// Unit Type routes
router.get('/unit-types', propertyController.getUnitTypes.bind(propertyController));
router.post('/unit-types', propertyController.createUnitType.bind(propertyController));

// Amenity routes
router.get('/amenities', propertyController.getAmenities.bind(propertyController));
router.post('/amenities', propertyController.createAmenity.bind(propertyController));

// Parking routes
router.get('/parkings', propertyController.getParkings.bind(propertyController));
router.post('/parkings', propertyController.createParking.bind(propertyController));

// Unit Images routes
router.get('/units/:unitId/images', validate(validateId), propertyController.getUnitImages.bind(propertyController));
router.post('/units/:unitId/images', validate(validateId), propertyController.addUnitImage.bind(propertyController));
router.put('/units/:unitId/images/:imageId', validate(validateId), propertyController.updateUnitImage.bind(propertyController));
router.delete('/units/:unitId/images/:imageId', validate(validateId), propertyController.deleteUnitImage.bind(propertyController));
router.post('/units/:unitId/images/reorder', validate(validateId), propertyController.reorderUnitImages.bind(propertyController));

// Unit Documents routes
router.get('/units/:unitId/documents', validate(validateId), propertyController.getUnitDocuments.bind(propertyController));
router.post('/units/:unitId/documents', validate(validateId), propertyController.addUnitDocument.bind(propertyController));
router.delete('/units/:unitId/documents/:docId', validate(validateId), propertyController.deleteUnitDocument.bind(propertyController));

export default router;

