import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, validateUserCreate, validateUserUpdate, validateId } from '../middleware/validator';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', userController.getUsers.bind(userController));
router.get('/:id', validate(validateId), userController.getUserById.bind(userController));
router.post('/', requireAdmin, validate(validateUserCreate), userController.createUser.bind(userController));
router.put('/:id', validate([...validateId, ...validateUserUpdate]), userController.updateUser.bind(userController));
router.delete('/:id', requireAdmin, validate(validateId), userController.deleteUser.bind(userController));

// Role routes
router.get('/roles/list', userController.getRoles.bind(userController));
router.get('/roles/:id', validate(validateId), userController.getRoleById.bind(userController));
router.post('/roles', requireAdmin, userController.createRole.bind(userController));
router.put('/roles/:id', requireAdmin, validate(validateId), userController.updateRole.bind(userController));
router.delete('/roles/:id', requireAdmin, validate(validateId), userController.deleteRole.bind(userController));

// Permission routes
router.get('/permissions/list', userController.getPermissions.bind(userController));
router.post('/roles/:id/permissions', requireAdmin, validate(validateId), userController.assignPermissionsToRole.bind(userController));

export default router;

