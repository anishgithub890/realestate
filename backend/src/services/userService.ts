import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';
import { cache } from '../config/redis';
import { config } from '../config/env';

export class UserService {
  async getUsers(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role_id) {
      where.role_id = parseInt(filters.role_id);
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
          company: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          is_admin: true,
          is_active: true,
          role_id: true,
          company_id: true,
          created_at: true,
          updated_at: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getUserById(id: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async createUser(data: any, companyId: number, createdBy: number) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        is_admin: data.is_admin || 'false',
        is_active: data.is_active || 'true',
        role_id: data.role_id || null,
        company_id: companyId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    return user;
  }

  async updateUser(id: number, data: any, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Hash password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    // Clear cached permissions if role changed
    if (data.role_id) {
      await cache.del(`permissions:${id}:${data.role_id}`);
    }

    return updatedUser;
  }

  async deleteUser(id: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Don't allow deleting yourself
    // This check should be done in controller with req.user

    await prisma.user.delete({
      where: { id },
    });

    // Clear cached data
    await cache.del(`session:${id}:${companyId}`);
    await cache.del(`permissions:${id}:${user.role_id}`);

    return { message: 'User deleted successfully' };
  }

  // Role Management
  async getRoles(companyId: number) {
    return prisma.role.findMany({
      where: { company_id: companyId },
      include: {
        permissions: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async getRoleById(id: number, companyId: number) {
    const role = await prisma.role.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        permissions: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Role');
    }

    return role;
  }

  async createRole(data: any, companyId: number) {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        company_id: companyId,
        permissions: {
          connect: data.permission_ids?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    return role;
  }

  async updateRole(id: number, data: any, companyId: number) {
    const role = await prisma.role.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!role) {
      throw new NotFoundError('Role');
    }

    const updateData: any = {
      name: data.name,
    };

    if (data.permission_ids) {
      updateData.permissions = {
        set: data.permission_ids.map((pid: number) => ({ id: pid })),
      };
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
      },
    });

    // Clear cached permissions for all users with this role
    const usersWithRole = await prisma.user.findMany({
      where: { role_id: id },
      select: { id: true },
    });

    for (const user of usersWithRole) {
      await cache.del(`permissions:${user.id}:${id}`);
    }

    return updatedRole;
  }

  async deleteRole(id: number, companyId: number) {
    const role = await prisma.role.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Role');
    }

    if (role._count.users > 0) {
      throw new ValidationError('Cannot delete role with assigned users');
    }

    await prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  // Permission Management
  async getPermissions(companyId: number) {
    return prisma.permission.findMany({
      where: { company_id: companyId },
      orderBy: {
        category: 'asc',
      },
    });
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[], companyId: number) {
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        company_id: companyId,
      },
    });

    if (!role) {
      throw new NotFoundError('Role');
    }

    // Verify all permissions belong to the company
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
        company_id: companyId,
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new ValidationError('Some permissions not found or do not belong to company');
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    // Clear cached permissions for all users with this role
    const usersWithRole = await prisma.user.findMany({
      where: { role_id: roleId },
      select: { id: true },
    });

    for (const user of usersWithRole) {
      await cache.del(`permissions:${user.id}:${roleId}`);
    }

    return updatedRole;
  }
}

