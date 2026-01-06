import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId, validateLocationCreate, validateLocationUpdate } from '../utils/validation';

const router = Router();
const locationController = new LocationController();

// All routes require authentication
router.use(authenticate);

// Get all locations
router.get(
  '/',
  validatePagination,
  validate,
  locationController.getLocations.bind(locationController)
);

// Get location tree
router.get(
  '/tree',
  validate,
  locationController.getLocationTree.bind(locationController)
);

// Get locations by level
router.get(
  '/level/:level',
  validateId,
  validate,
  locationController.getLocationsByLevel.bind(locationController)
);

// Get location path (breadcrumb)
router.get(
  '/:id/path',
  validateId,
  validate,
  locationController.getLocationPath.bind(locationController)
);

// Get location by ID
router.get(
  '/:id',
  validateId,
  validate,
  locationController.getLocationById.bind(locationController)
);

// Create location
router.post(
  '/',
  validateLocationCreate,
  validate,
  locationController.createLocation.bind(locationController)
);

// Update location
router.put(
  '/:id',
  validateId,
  validateLocationUpdate,
  validate,
  locationController.updateLocation.bind(locationController)
);

// Delete location
router.delete(
  '/:id',
  validateId,
  validate,
  locationController.deleteLocation.bind(locationController)
);

export default router;

