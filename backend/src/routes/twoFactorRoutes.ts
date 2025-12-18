import { Router } from 'express';
import { TwoFactorController } from '../controllers/twoFactorController';
import { authenticate } from '../middleware/auth';

const router = Router();
const twoFactorController = new TwoFactorController();

router.use(authenticate);

router.get('/status', twoFactorController.get2FAStatus.bind(twoFactorController));
router.post('/enable', twoFactorController.enable2FA.bind(twoFactorController));
router.post('/verify-enable', twoFactorController.verifyAndEnable2FA.bind(twoFactorController));
router.post('/disable', twoFactorController.disable2FA.bind(twoFactorController));
router.post('/verify', twoFactorController.verify2FA.bind(twoFactorController));
router.post('/regenerate-backup-codes', twoFactorController.regenerateBackupCodes.bind(twoFactorController));

export default router;

