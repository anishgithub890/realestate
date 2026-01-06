import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcementController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const announcementController = new AnnouncementController();

router.use(authenticate);

router.get(
  '/',
  validatePagination,
  validate,
  announcementController.getAnnouncements.bind(announcementController)
);

router.get(
  '/:id',
  validateId,
  validate,
  announcementController.getAnnouncementById.bind(announcementController)
);

router.post(
  '/',
  validate,
  announcementController.createAnnouncement.bind(announcementController)
);

router.put(
  '/:id',
  validateId,
  validate,
  announcementController.updateAnnouncement.bind(announcementController)
);

router.delete(
  '/:id',
  validateId,
  validate,
  announcementController.deleteAnnouncement.bind(announcementController)
);

export default router;

