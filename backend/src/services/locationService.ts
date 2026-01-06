import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class LocationService {
  /**
   * Get all locations with hierarchy
   */
  async getLocations(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { slug: { contains: filters.search } },
        { full_path: { contains: filters.search } },
      ];
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.parent_id) {
      where.parent_id = filters.parent_id;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true';
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'sort_order', sortOrder || 'asc'),
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              level: true,
              full_path: true,
            },
          },
          _count: {
            select: {
              children: true,
              buildings: true,
            },
          },
        },
      }),
      prisma.location.count({ where }),
    ]);

    return {
      items: locations,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: string, companyId: number) {
    const location = await prisma.location.findFirst({
      where: { id, company_id: companyId },
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        children: {
          orderBy: { sort_order: 'asc' },
          include: {
            _count: {
              select: {
                children: true,
                buildings: true,
              },
            },
          },
        },
        buildings: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            children: true,
            buildings: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundError('Location');
    }

    return location;
  }

  /**
   * Get location hierarchy tree
   */
  async getLocationTree(companyId: number, parentId?: string): Promise<any[]> {
    const where: any = { company_id: companyId, is_active: true };

    if (parentId) {
      where.parent_id = parentId;
    } else {
      where.parent_id = null;
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      include: {
        _count: {
          select: {
            children: true,
            buildings: true,
          },
        },
      },
    });

    // Recursively fetch children
    const tree: any[] = await Promise.all(
      locations.map(async (location: any) => {
        const children: any[] = await this.getLocationTree(companyId, location.id);
        return {
          ...location,
          children,
        };
      })
    );

    return tree;
  }

  /**
   * Generate full path for location
   */
  private async generateFullPath(
    name: string,
    parentId: string | null,
    companyId: number
  ): Promise<string> {
    if (!parentId) {
      return name;
    }

    const parent = await prisma.location.findFirst({
      where: { id: parentId, company_id: companyId },
    });

    if (!parent) {
      throw new NotFoundError('Parent Location');
    }

    return `${parent.full_path} > ${name}`;
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Create location
   */
  async createLocation(data: any, companyId: number) {
    // Validate level hierarchy
    if (data.parent_id) {
      const parent = await prisma.location.findFirst({
        where: { id: data.parent_id, company_id: companyId },
      });

      if (!parent) {
        throw new NotFoundError('Parent Location');
      }

      // Validate level progression
      const levelOrder: Record<string, number> = {
        EMIRATE: 0,
        NEIGHBOURHOOD: 1,
        CLUSTER: 2,
        BUILDING: 3,
        BUILDING_LVL1: 4,
        BUILDING_LVL2: 5,
      };

      const parentLevel = levelOrder[parent.level] ?? -1;
      const newLevel = levelOrder[data.level] ?? -1;

      if (newLevel <= parentLevel) {
        throw new ValidationError(
          `Invalid level hierarchy. ${data.level} must be higher than ${parent.level}`
        );
      }
    } else {
      // Root level must be EMIRATE
      if (data.level !== 'EMIRATE') {
        throw new ValidationError('Root location must be EMIRATE level');
      }
    }

    const fullPath = await this.generateFullPath(data.name, data.parent_id || null, companyId);
    const slug = data.slug || this.generateSlug(data.name);

    // Check if slug already exists
    const existingSlug = await prisma.location.findFirst({
      where: { slug, company_id: companyId },
    });

    if (existingSlug) {
      throw new ValidationError('Location with this slug already exists');
    }

    // Check if full_path already exists
    const existingPath = await prisma.location.findFirst({
      where: { full_path: fullPath, company_id: companyId },
    });

    if (existingPath) {
      throw new ValidationError('Location with this full path already exists');
    }

    const location = await prisma.location.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        parent_id: data.parent_id || null,
        level: data.level || 'EMIRATE',
        full_path: fullPath,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 0,
        company_id: companyId,
      },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            buildings: true,
          },
        },
      },
    });

    return location;
  }

  /**
   * Update location
   */
  async updateLocation(id: string, data: any, companyId: number) {
    const location = await prisma.location.findFirst({
      where: { id, company_id: companyId },
    });

    if (!location) {
      throw new NotFoundError('Location');
    }

    // If name or parent changes, regenerate full_path
    let fullPath = location.full_path;
    if (data.name || data.parent_id !== undefined) {
      const newName = data.name || location.name;
      const newParentId = data.parent_id !== undefined ? data.parent_id : location.parent_id;
      fullPath = await this.generateFullPath(newName, newParentId, companyId);
    }

    // If slug changes, validate uniqueness
    let slug = location.slug;
    if (data.slug && data.slug !== location.slug) {
      const existingSlug = await prisma.location.findFirst({
        where: { slug: data.slug, company_id: companyId, id: { not: id } },
      });

      if (existingSlug) {
        throw new ValidationError('Location with this slug already exists');
      }
      slug = data.slug;
    }

    // Validate level hierarchy if parent or level changes
    if (data.parent_id !== undefined || data.level) {
      const parentId = data.parent_id !== undefined ? data.parent_id : location.parent_id;
      const level = data.level || location.level;

      if (parentId) {
        const parent = await prisma.location.findFirst({
          where: { id: parentId, company_id: companyId },
        });

        if (!parent) {
          throw new NotFoundError('Parent Location');
        }

        const levelOrder: Record<string, number> = {
          EMIRATE: 0,
          NEIGHBOURHOOD: 1,
          CLUSTER: 2,
          BUILDING: 3,
          BUILDING_LVL1: 4,
          BUILDING_LVL2: 5,
        };

        const parentLevel = levelOrder[parent.level] ?? -1;
        const newLevel = levelOrder[level] ?? -1;

        if (newLevel <= parentLevel) {
          throw new ValidationError(
            `Invalid level hierarchy. ${level} must be higher than ${parent.level}`
          );
        }
      }
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        parent_id: data.parent_id !== undefined ? data.parent_id : undefined,
        level: data.level,
        full_path: fullPath,
        latitude: data.latitude !== undefined ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude !== undefined ? parseFloat(data.longitude) : undefined,
        is_active: data.is_active !== undefined ? data.is_active : undefined,
        sort_order: data.sort_order !== undefined ? parseInt(data.sort_order) : undefined,
      },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            buildings: true,
          },
        },
      },
    });

    // Update children's full_path if parent name or path changed
    if (data.name || data.parent_id !== undefined) {
      await this.updateChildrenPaths(id, companyId);
    }

    return updated;
  }

  /**
   * Recursively update children paths
   */
  private async updateChildrenPaths(parentId: string, companyId: number): Promise<void> {
    const children = await prisma.location.findMany({
      where: { parent_id: parentId, company_id: companyId },
    });

    for (const child of children) {
      const parent = await prisma.location.findFirst({
        where: { id: parentId, company_id: companyId },
      });

      if (parent) {
        const newFullPath = `${parent.full_path} > ${child.name}`;
        await prisma.location.update({
          where: { id: child.id },
          data: { full_path: newFullPath },
        });

        // Recursively update grandchildren
        await this.updateChildrenPaths(child.id, companyId);
      }
    }
  }

  /**
   * Delete location
   */
  async deleteLocation(id: string, companyId: number) {
    const location = await prisma.location.findFirst({
      where: { id, company_id: companyId },
      include: {
        _count: {
          select: {
            children: true,
            buildings: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundError('Location');
    }

    if (location._count.children > 0) {
      throw new ValidationError('Cannot delete location with child locations');
    }

    if (location._count.buildings > 0) {
      throw new ValidationError('Cannot delete location with associated buildings');
    }

    await prisma.location.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get locations by level
   */
  async getLocationsByLevel(companyId: number, level: string) {
    const locations = await prisma.location.findMany({
      where: {
        company_id: companyId,
        level: level as any,
        is_active: true,
      },
      orderBy: { sort_order: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return locations;
  }

  /**
   * Get location path (breadcrumb)
   */
  async getLocationPath(id: string, companyId: number): Promise<any[]> {
    const path: any[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const location: any = await prisma.location.findFirst({
        where: { id: currentId, company_id: companyId },
        select: {
          id: true,
          name: true,
          level: true,
          parent_id: true,
        },
      });

      if (!location) break;

      path.unshift(location);
      currentId = location.parent_id;
    }

    return path;
  }
}

