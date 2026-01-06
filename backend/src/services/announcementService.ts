import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class AnnouncementService {
  async getAnnouncements(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { message: { contains: filters.search } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true';
    }

    if (filters.start_date || filters.end_date) {
      where.AND = [];
      if (filters.start_date) {
        where.AND.push({ start_date: { gte: new Date(filters.start_date) } });
      }
      if (filters.end_date) {
        where.AND.push({ end_date: { lte: new Date(filters.end_date) } });
      }
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.announcement.count({ where }),
    ]);

    return {
      items: announcements,
      pagination: { page, limit, total },
    };
  }

  async getAnnouncementById(id: number, companyId: number) {
    const announcement = await prisma.announcement.findFirst({
      where: { id, company_id: companyId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    return announcement;
  }

  async createAnnouncement(data: any, companyId: number, userId: number) {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || null,
        target_scope: data.target_scope || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
        company_id: companyId,
        created_by: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return announcement;
  }

  async updateAnnouncement(id: number, data: any, companyId: number) {
    const announcement = await prisma.announcement.findFirst({
      where: { id, company_id: companyId },
    });

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        message: data.message,
        type: data.type !== undefined ? data.type : undefined,
        target_scope: data.target_scope !== undefined ? data.target_scope : undefined,
        is_active: data.is_active !== undefined ? data.is_active : undefined,
        start_date: data.start_date !== undefined ? (data.start_date ? new Date(data.start_date) : null) : undefined,
        end_date: data.end_date !== undefined ? (data.end_date ? new Date(data.end_date) : null) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteAnnouncement(id: number, companyId: number) {
    const announcement = await prisma.announcement.findFirst({
      where: { id, company_id: companyId },
    });

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return { success: true };
  }
}

