import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { validatePagination, validateId } from '../utils/validation';

const router = Router();
const attendanceController = new AttendanceController();

// All routes require authentication
router.use(authenticate);

// Check in/out
router.post(
  '/check-in',
  validate,
  attendanceController.checkIn.bind(attendanceController)
);

router.post(
  '/check-out',
  validate,
  attendanceController.checkOut.bind(attendanceController)
);

// Attendance records
router.get(
  '/',
  validatePagination,
  validate,
  attendanceController.getAttendances.bind(attendanceController)
);

router.get(
  '/:id',
  validateId,
  validate,
  attendanceController.getAttendanceById.bind(attendanceController)
);

router.put(
  '/:id/status',
  validateId,
  validate,
  attendanceController.updateAttendanceStatus.bind(attendanceController)
);

// Reports
router.get(
  '/reports/user/:userId',
  validateId,
  validate,
  attendanceController.getAttendanceReport.bind(attendanceController)
);

router.get(
  '/reports/team',
  validate,
  attendanceController.getTeamPerformance.bind(attendanceController)
);

// Activities
router.post(
  '/activities',
  validate,
  attendanceController.logActivity.bind(attendanceController)
);

router.get(
  '/activities',
  validatePagination,
  validate,
  attendanceController.getUserActivities.bind(attendanceController)
);

export default router;

