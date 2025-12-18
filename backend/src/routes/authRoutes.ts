import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, validateLogin } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/oauth/token', authLimiter, authController.oauth2Token.bind(authController));
router.post('/login', authLimiter, validate(validateLogin), authController.login.bind(authController));
router.post('/forgot-password', authLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', authLimiter, authController.resetPassword.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));
router.get('/companies', authenticate, authController.getCompanies.bind(authController));
router.post('/select-company', authenticate, authController.selectCompany.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

export default router;

