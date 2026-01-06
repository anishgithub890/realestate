import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class RequestService {
  async getRequests(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { request_no: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.type_id) {
      where.type_id = parseInt(filters.type_id);
    }

    if (filters.status_id) {
      where.status_id = parseInt(filters.status_id);
    }

    if (filters.tenant_id) {
      where.tenant_id = parseInt(filters.tenant_id);
    }

    if (filters.landlord_id) {
      where.landlord_id = parseInt(filters.landlord_id);
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          type: true,
          status: true,
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          landlord: {
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
            },
          },
        },
      }),
      prisma.request.count({ where }),
    ]);

    return {
      items: requests,
      pagination: { page, limit, total },
    };
  }

  async getRequestById(id: number, companyId: number) {
    const request = await prisma.request.findFirst({
      where: { id, company_id: companyId },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    return request;
  }

  async createRequest(data: any, companyId: number, userId: number) {
    // Generate request number
    const requestNo = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const request = await prisma.request.create({
      data: {
        request_no: requestNo,
        type_id: data.type_id,
        status_id: data.status_id,
        description: data.description,
        tenant_id: data.tenant_id || null,
        landlord_id: data.landlord_id || null,
        company_id: companyId,
        created_by: userId,
      },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return request;
  }

  async updateRequest(id: number, data: any, companyId: number) {
    const request = await prisma.request.findFirst({
      where: { id, company_id: companyId },
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        type_id: data.type_id !== undefined ? data.type_id : undefined,
        status_id: data.status_id !== undefined ? data.status_id : undefined,
        description: data.description !== undefined ? data.description : undefined,
        tenant_id: data.tenant_id !== undefined ? data.tenant_id : undefined,
        landlord_id: data.landlord_id !== undefined ? data.landlord_id : undefined,
      },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteRequest(id: number, companyId: number) {
    const request = await prisma.request.findFirst({
      where: { id, company_id: companyId },
    });

    if (!request) {
      throw new NotFoundError('Request');
    }

    await prisma.request.delete({
      where: { id },
    });

    return { success: true };
  }
}

