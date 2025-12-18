import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { authenticate } from '../middleware/auth';

const router = Router();
const sessionController = new SessionController();

router.use(authenticate);

router.get('/', sessionController.getUserSessions.bind(sessionController));
router.get('/stats', sessionController.getSessionStats.bind(sessionController));
router.delete('/:session_token', sessionController.revokeSession.bind(sessionController));
router.delete('/all/revoke', sessionController.revokeAllSessions.bind(sessionController));

export default router;

