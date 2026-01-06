import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class RentalApprovalService {
  async getRentalApprovals(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { request_no: { contains: filters.search } },
        { remarks: { contains: filters.search } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.unit_id) {
      where.unit_id = parseInt(filters.unit_id);
    }

    if (filters.tenant_id) {
      where.tenant_id = parseInt(filters.tenant_id);
    }

    const [approvals, total] = await Promise.all([
      prisma.rentalApproval.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          unit: {
            select: {
              id: true,
              name: true,
            },
          },
          tenant: {
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
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.rentalApproval.count({ where }),
    ]);

    return {
      items: approvals,
      pagination: { page, limit, total },
    };
  }

  async getRentalApprovalById(id: number, companyId: number) {
    const approval = await prisma.rentalApproval.findFirst({
      where: { id, company_id: companyId },
      include: {
        unit: true,
        tenant: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundError('Rental Approval');
    }

    return approval;
  }

  async createRentalApproval(data: any, companyId: number, userId: number) {
    // Generate request number
    const requestNo = `RA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const approval = await prisma.rentalApproval.create({
      data: {
        request_no: requestNo,
        unit_id: data.unit_id,
        tenant_id: data.tenant_id,
        status: 'pending',
        remarks: data.remarks || null,
        company_id: companyId,
        created_by: userId,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
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
    });

    return approval;
  }

  async updateRentalApproval(id: number, data: any, companyId: number) {
    const approval = await prisma.rentalApproval.findFirst({
      where: { id, company_id: companyId },
    });

    if (!approval) {
      throw new NotFoundError('Rental Approval');
    }

    const updated = await prisma.rentalApproval.update({
      where: { id },
      data: {
        remarks: data.remarks !== undefined ? data.remarks : undefined,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
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
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async approveRentalApproval(id: number, companyId: number, userId: number, remarks?: string) {
    const approval = await prisma.rentalApproval.findFirst({
      where: { id, company_id: companyId },
    });

    if (!approval) {
      throw new NotFoundError('Rental Approval');
    }

    if (approval.status !== 'pending') {
      throw new ValidationError('Only pending approvals can be approved');
    }

    const updated = await prisma.rentalApproval.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: userId,
        remarks: remarks || approval.remarks,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
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
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async rejectRentalApproval(id: number, companyId: number, userId: number, remarks?: string) {
    const approval = await prisma.rentalApproval.findFirst({
      where: { id, company_id: companyId },
    });

    if (!approval) {
      throw new NotFoundError('Rental Approval');
    }

    if (approval.status !== 'pending') {
      throw new ValidationError('Only pending approvals can be rejected');
    }

    const updated = await prisma.rentalApproval.update({
      where: { id },
      data: {
        status: 'rejected',
        approved_by: userId,
        remarks: remarks || approval.remarks,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
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
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteRentalApproval(id: number, companyId: number) {
    const approval = await prisma.rentalApproval.findFirst({
      where: { id, company_id: companyId },
    });

    if (!approval) {
      throw new NotFoundError('Rental Approval');
    }

    await prisma.rentalApproval.delete({
      where: { id },
    });

    return { success: true };
  }
}

