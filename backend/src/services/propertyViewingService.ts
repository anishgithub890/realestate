import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class PropertyViewingService {
  async getViewings(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.unit_id) where.unit_id = parseInt(filters.unit_id);
    if (filters.lead_id) where.lead_id = parseInt(filters.lead_id);
    if (filters.status) where.status = filters.status;
    if (filters.assigned_to) where.assigned_to = parseInt(filters.assigned_to);
    if (filters.viewing_date_from) {
      where.viewing_date = { gte: new Date(filters.viewing_date_from) };
    }
    if (filters.viewing_date_to) {
      where.viewing_date = {
        ...where.viewing_date,
        lte: new Date(filters.viewing_date_to),
      };
    }

    const [viewings, total] = await Promise.all([
      prisma.propertyViewing.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
              floor: true,
            },
          },
          lead: true,
          tenant: true,
          assigned_agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.propertyViewing.count({ where }),
    ]);

    return { items: viewings, pagination: { page, limit, total } };
  }

  async getViewingById(id: number, companyId: number) {
    const viewing = await prisma.propertyViewing.findFirst({
      where: { id, company_id: companyId },
      include: {
        unit: {
          include: {
            building: true,
            floor: true,
            unit_type: true,
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
        lead: true,
        tenant: true,
        assigned_agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!viewing) throw new NotFoundError('Viewing');
    return viewing;
  }

  async createViewing(data: any, companyId: number, createdBy: number) {
    // Verify unit exists
    const unit = await prisma.unit.findFirst({
      where: { id: data.unit_id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    // Verify lead or tenant if provided
    if (data.lead_id) {
      const lead = await prisma.lead.findFirst({
        where: { id: data.lead_id, company_id: companyId },
      });
      if (!lead) throw new NotFoundError('Lead');
    }

    if (data.tenant_id) {
      const tenant = await prisma.tenant.findFirst({
        where: { id: data.tenant_id, company_id: companyId },
      });
      if (!tenant) throw new NotFoundError('Tenant');
    }

    return prisma.propertyViewing.create({
      data: {
        unit_id: data.unit_id,
        lead_id: data.lead_id || null,
        tenant_id: data.tenant_id || null,
        viewer_name: data.viewer_name,
        viewer_email: data.viewer_email,
        viewer_phone: data.viewer_phone,
        viewing_date: new Date(data.viewing_date),
        viewing_time: data.viewing_time,
        status: data.status || 'scheduled',
        notes: data.notes,
        company_id: companyId,
        assigned_to: data.assigned_to || null,
        created_by: createdBy,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async updateViewing(id: number, data: any, companyId: number) {
    const viewing = await prisma.propertyViewing.findFirst({
      where: { id, company_id: companyId },
    });

    if (!viewing) throw new NotFoundError('Viewing');

    const updateData: any = { ...data };
    if (data.viewing_date) updateData.viewing_date = new Date(data.viewing_date);

    return prisma.propertyViewing.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async deleteViewing(id: number, companyId: number) {
    const viewing = await prisma.propertyViewing.findFirst({
      where: { id, company_id: companyId },
    });

    if (!viewing) throw new NotFoundError('Viewing');

    await prisma.propertyViewing.delete({
      where: { id },
    });

    return { message: 'Viewing deleted successfully' };
  }

  async updateViewingStatus(id: number, status: string, feedback: string, rating: number, companyId: number) {
    const viewing = await prisma.propertyViewing.findFirst({
      where: { id, company_id: companyId },
    });

    if (!viewing) throw new NotFoundError('Viewing');

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Valid: ${validStatuses.join(', ')}`);
    }

    return prisma.propertyViewing.update({
      where: { id },
      data: {
        status,
        feedback,
        rating: rating || null,
      },
    });
  }

  async getUnitViewings(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyViewing.findMany({
      where: {
        unit_id: unitId,
        company_id: companyId,
      },
      include: {
        lead: true,
        tenant: true,
        assigned_agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { viewing_date: 'desc' },
    });
  }
}

