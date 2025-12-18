import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { validateUserCreate, validateUserUpdate, validateId } from '../utils/validation';
import { validate } from '../middleware/validator';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await userService.getUsers(
        req.user.companyId,
        req.query,
        req.query
      );

      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id, req.user.companyId);
      sendSuccess(res, user);
    } catch (error: any) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await userService.createUser(req.body, req.user.companyId, req.user.userId);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const user = await userService.updateUser(id, req.body, req.user.companyId);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Prevent self-deletion
      const id = parseInt(req.params.id);
      if (id === req.user.userId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
          code: 'SELF_DELETE_FORBIDDEN',
        });
      }

      const result = await userService.deleteUser(id, req.user.companyId);
      sendSuccess(res, result, 'User deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Role Management
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const roles = await userService.getRoles(req.user.companyId);
      sendSuccess(res, roles);
    } catch (error: any) {
      next(error);
    }
  }

  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const role = await userService.getRoleById(id, req.user.companyId);
      sendSuccess(res, role);
    } catch (error: any) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const role = await userService.createRole(req.body, req.user.companyId);
      sendSuccess(res, role, 'Role created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const role = await userService.updateRole(id, req.body, req.user.companyId);
      sendSuccess(res, role, 'Role updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await userService.deleteRole(id, req.user.companyId);
      sendSuccess(res, result, 'Role deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Permission Management
  async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const permissions = await userService.getPermissions(req.user.companyId);
      sendSuccess(res, permissions);
    } catch (error: any) {
      next(error);
    }
  }

  async assignPermissionsToRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const roleId = parseInt(req.params.id);
      const { permission_ids } = req.body;

      if (!Array.isArray(permission_ids)) {
        return res.status(400).json({
          success: false,
          error: 'permission_ids must be an array',
          code: 'VALIDATION_ERROR',
        });
      }

      const role = await userService.assignPermissionsToRole(
        roleId,
        permission_ids,
        req.user.companyId
      );
      sendSuccess(res, role, 'Permissions assigned successfully');
    } catch (error: any) {
      next(error);
    }
  }
}

