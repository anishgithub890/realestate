import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class ComplaintService {
  async getComplaints(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { complaint_no: { contains: filters.search } },
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
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

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
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
      prisma.complaint.count({ where }),
    ]);

    return {
      items: complaints,
      pagination: { page, limit, total },
    };
  }

  async getComplaintById(id: number, companyId: number) {
    const complaint = await prisma.complaint.findFirst({
      where: { id, company_id: companyId },
      include: {
        status: true,
        tenant: true,
        landlord: true,
        creator: true,
        followups: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            status: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    return complaint;
  }

  async createComplaint(data: any, companyId: number, userId: number) {
    // Generate complaint number
    const complaintNo = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const complaint = await prisma.complaint.create({
      data: {
        complaint_no: complaintNo,
        type: data.type,
        title: data.title,
        description: data.description,
        status_id: data.status_id,
        tenant_id: data.tenant_id || null,
        landlord_id: data.landlord_id || null,
        company_id: companyId,
        created_by: userId,
      },
      include: {
        status: true,
        tenant: true,
        landlord: true,
        creator: true,
      },
    });

    return complaint;
  }

  async updateComplaint(id: number, data: any, companyId: number) {
    const complaint = await prisma.complaint.findFirst({
      where: { id, company_id: companyId },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        type: data.type !== undefined ? data.type : undefined,
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        status_id: data.status_id !== undefined ? data.status_id : undefined,
        tenant_id: data.tenant_id !== undefined ? data.tenant_id : undefined,
        landlord_id: data.landlord_id !== undefined ? data.landlord_id : undefined,
      },
      include: {
        status: true,
        tenant: true,
        landlord: true,
        creator: true,
      },
    });

    return updated;
  }

  async deleteComplaint(id: number, companyId: number) {
    const complaint = await prisma.complaint.findFirst({
      where: { id, company_id: companyId },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint');
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return { success: true };
  }
}

