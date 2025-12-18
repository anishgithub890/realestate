import { Router } from 'express';
import { PropertyAdvancedController } from '../controllers/propertyAdvancedController';
import { authenticate } from '../middleware/auth';
import { validate, validateId } from '../middleware/validator';

const router = Router();
const controller = new PropertyAdvancedController();

router.use(authenticate);

// Favorites
router.post('/favorites', controller.addFavorite.bind(controller));
router.delete('/favorites/:unitId', validate(validateId), controller.removeFavorite.bind(controller));
router.get('/favorites', controller.getUserFavorites.bind(controller));
router.get('/favorites/leads/:leadId', validate(validateId), controller.getLeadFavorites.bind(controller));

// Inspections
router.get('/inspections', controller.getInspections.bind(controller));
router.post('/inspections', controller.createInspection.bind(controller));
router.get('/inspections/units/:unitId', validate(validateId), controller.getUnitInspections.bind(controller));

// Valuations
router.get('/valuations', controller.getValuations.bind(controller));
router.post('/valuations', controller.createValuation.bind(controller));
router.get('/valuations/units/:unitId', validate(validateId), controller.getUnitValuations.bind(controller));

// Insurance
router.get('/insurances', controller.getInsurances.bind(controller));
router.post('/insurances', controller.createInsurance.bind(controller));
router.get('/insurances/units/:unitId', validate(validateId), controller.getUnitInsurances.bind(controller));

// Maintenance History
router.get('/maintenance-history', controller.getMaintenanceHistory.bind(controller));
router.post('/maintenance-history', controller.createMaintenanceHistory.bind(controller));
router.get('/maintenance-history/units/:unitId', validate(validateId), controller.getUnitMaintenanceHistory.bind(controller));

// Notifications
router.get('/notifications', controller.getNotifications.bind(controller));
router.put('/notifications/:id/read', validate(validateId), controller.markAsRead.bind(controller));
router.put('/notifications/read-all', controller.markAllAsRead.bind(controller));
router.get('/notifications/unread-count', controller.getUnreadCount.bind(controller));

// Analytics
router.post('/analytics/track-view/:unitId', validate(validateId), controller.trackView.bind(controller));
router.get('/analytics/units/:unitId', validate(validateId), controller.getUnitAnalytics.bind(controller));
router.post('/analytics/track/:unitId/:metric', validate(validateId), controller.trackMetric.bind(controller));

export default router;

