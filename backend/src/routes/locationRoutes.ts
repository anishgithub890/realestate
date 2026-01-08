import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { uploadSingle } from '../middleware/upload';
import { validatePagination, validateLocationId, validateLocationCreate, validateLocationUpdate } from '../utils/validation';

const router = Router();
const locationController = new LocationController();

// All routes require authentication
router.use(authenticate);

// Get all locations
router.get(
  '/',
  validate(validatePagination),
  locationController.getLocations.bind(locationController)
);

// Get location tree
router.get(
  '/tree',
  validate([]),
  locationController.getLocationTree.bind(locationController)
);

// Get locations by level
router.get(
  '/level/:level',
  validate([]), // Level is a string, not an ID
  locationController.getLocationsByLevel.bind(locationController)
);

// Bulk upload locations from CSV (must be before /:id routes)
router.post(
  '/bulk-upload',
  uploadSingle('file'),
  locationController.bulkUploadLocationsFromCsv.bind(locationController)
);

// Get location path (breadcrumb)
router.get(
  '/:id/path',
  validate(validateLocationId),
  locationController.getLocationPath.bind(locationController)
);

// Get location by ID
router.get(
  '/:id',
  validate(validateLocationId),
  locationController.getLocationById.bind(locationController)
);

// Create location
router.post(
  '/',
  validate(validateLocationCreate),
  locationController.createLocation.bind(locationController)
);

// Update location
router.put(
  '/:id',
  validate([...validateLocationId, ...validateLocationUpdate]),
  locationController.updateLocation.bind(locationController)
);

// Delete location
router.delete(
  '/:id',
  validate(validateLocationId),
  locationController.deleteLocation.bind(locationController)
);

export default router;

