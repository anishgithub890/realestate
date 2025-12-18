import { Router } from 'express';
import { ProviderController } from '../controllers/providerController';
import { authenticate } from '../middleware/auth';

const router = Router();
const providerController = new ProviderController();

// Public route
router.post('/signup', providerController.signupWithProvider.bind(providerController));

// Protected routes
router.use(authenticate);
router.get('/', providerController.getUserProviders.bind(providerController));
router.post('/link', providerController.linkProvider.bind(providerController));
router.delete('/unlink/:provider', providerController.unlinkProvider.bind(providerController));

export default router;

