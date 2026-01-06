import { Router } from 'express';
import { MasterDataController } from '../controllers/masterDataController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const masterDataController = new MasterDataController();

router.use(authenticate);

// Countries
router.get('/countries', validatePagination, validate, masterDataController.getCountries.bind(masterDataController));
router.post('/countries', validate, masterDataController.createCountry.bind(masterDataController));
router.put('/countries/:id', validateId, validate, masterDataController.updateCountry.bind(masterDataController));
router.delete('/countries/:id', validateId, validate, masterDataController.deleteCountry.bind(masterDataController));

// States
router.get('/states', validatePagination, validate, masterDataController.getStates.bind(masterDataController));
router.post('/states', validate, masterDataController.createState.bind(masterDataController));
router.put('/states/:id', validateId, validate, masterDataController.updateState.bind(masterDataController));
router.delete('/states/:id', validateId, validate, masterDataController.deleteState.bind(masterDataController));

// Areas
router.get('/areas', validatePagination, validate, masterDataController.getAreas.bind(masterDataController));
router.post('/areas', validate, masterDataController.createArea.bind(masterDataController));
router.put('/areas/:id', validateId, validate, masterDataController.updateArea.bind(masterDataController));
router.delete('/areas/:id', validateId, validate, masterDataController.deleteArea.bind(masterDataController));

// Unit Types
router.get('/unit-types', validatePagination, validate, masterDataController.getUnitTypes.bind(masterDataController));
router.post('/unit-types', validate, masterDataController.createUnitType.bind(masterDataController));
router.put('/unit-types/:id', validateId, validate, masterDataController.updateUnitType.bind(masterDataController));
router.delete('/unit-types/:id', validateId, validate, masterDataController.deleteUnitType.bind(masterDataController));

// Amenities
router.get('/amenities', validatePagination, validate, masterDataController.getAmenities.bind(masterDataController));
router.post('/amenities', validate, masterDataController.createAmenity.bind(masterDataController));
router.put('/amenities/:id', validateId, validate, masterDataController.updateAmenity.bind(masterDataController));
router.delete('/amenities/:id', validateId, validate, masterDataController.deleteAmenity.bind(masterDataController));

// Maintenance Types
router.get('/maintenance-types', validatePagination, validate, masterDataController.getMaintenanceTypes.bind(masterDataController));
router.post('/maintenance-types', validate, masterDataController.createMaintenanceType.bind(masterDataController));
router.put('/maintenance-types/:id', validateId, validate, masterDataController.updateMaintenanceType.bind(masterDataController));
router.delete('/maintenance-types/:id', validateId, validate, masterDataController.deleteMaintenanceType.bind(masterDataController));

// Maintenance Statuses
router.get('/maintenance-statuses', validatePagination, validate, masterDataController.getMaintenanceStatuses.bind(masterDataController));
router.post('/maintenance-statuses', validate, masterDataController.createMaintenanceStatus.bind(masterDataController));
router.put('/maintenance-statuses/:id', validateId, validate, masterDataController.updateMaintenanceStatus.bind(masterDataController));
router.delete('/maintenance-statuses/:id', validateId, validate, masterDataController.deleteMaintenanceStatus.bind(masterDataController));

// Complaint Statuses
router.get('/complaint-statuses', validatePagination, validate, masterDataController.getComplaintStatuses.bind(masterDataController));
router.post('/complaint-statuses', validate, masterDataController.createComplaintStatus.bind(masterDataController));
router.put('/complaint-statuses/:id', validateId, validate, masterDataController.updateComplaintStatus.bind(masterDataController));
router.delete('/complaint-statuses/:id', validateId, validate, masterDataController.deleteComplaintStatus.bind(masterDataController));

// Lead Statuses
router.get('/lead-statuses', validatePagination, validate, masterDataController.getLeadStatuses.bind(masterDataController));
router.post('/lead-statuses', validate, masterDataController.createLeadStatus.bind(masterDataController));
router.put('/lead-statuses/:id', validateId, validate, masterDataController.updateLeadStatus.bind(masterDataController));
router.delete('/lead-statuses/:id', validateId, validate, masterDataController.deleteLeadStatus.bind(masterDataController));

// Activity Sources
router.get('/activity-sources', validatePagination, validate, masterDataController.getActivitySources.bind(masterDataController));
router.post('/activity-sources', validate, masterDataController.createActivitySource.bind(masterDataController));
router.put('/activity-sources/:id', validateId, validate, masterDataController.updateActivitySource.bind(masterDataController));
router.delete('/activity-sources/:id', validateId, validate, masterDataController.deleteActivitySource.bind(masterDataController));

// Followup Types
router.get('/followup-types', validatePagination, validate, masterDataController.getFollowupTypes.bind(masterDataController));
router.post('/followup-types', validate, masterDataController.createFollowupType.bind(masterDataController));
router.put('/followup-types/:id', validateId, validate, masterDataController.updateFollowupType.bind(masterDataController));
router.delete('/followup-types/:id', validateId, validate, masterDataController.deleteFollowupType.bind(masterDataController));

// Request Types
router.get('/request-types', validatePagination, validate, masterDataController.getRequestTypes.bind(masterDataController));
router.post('/request-types', validate, masterDataController.createRequestType.bind(masterDataController));
router.put('/request-types/:id', validateId, validate, masterDataController.updateRequestType.bind(masterDataController));
router.delete('/request-types/:id', validateId, validate, masterDataController.deleteRequestType.bind(masterDataController));

// Request Statuses
router.get('/request-statuses', validatePagination, validate, masterDataController.getRequestStatuses.bind(masterDataController));
router.post('/request-statuses', validate, masterDataController.createRequestStatus.bind(masterDataController));
router.put('/request-statuses/:id', validateId, validate, masterDataController.updateRequestStatus.bind(masterDataController));
router.delete('/request-statuses/:id', validateId, validate, masterDataController.deleteRequestStatus.bind(masterDataController));

// KYC Document Types
router.get('/kyc-doc-types', validatePagination, validate, masterDataController.getKycDocTypes.bind(masterDataController));
router.post('/kyc-doc-types', validate, masterDataController.createKycDocType.bind(masterDataController));
router.put('/kyc-doc-types/:id', validateId, validate, masterDataController.updateKycDocType.bind(masterDataController));
router.delete('/kyc-doc-types/:id', validateId, validate, masterDataController.deleteKycDocType.bind(masterDataController));

export default router;

