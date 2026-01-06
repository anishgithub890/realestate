import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class TicketService {
  async getTickets(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { ticket_no: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.status_id) {
      where.status_id = parseInt(filters.status_id);
    }

    if (filters.type_id) {
      where.type_id = parseInt(filters.type_id);
    }

    if (filters.assigned_to) {
      where.assigned_to = parseInt(filters.assigned_to);
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
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
          unit: {
            select: {
              id: true,
              name: true,
            },
          },
          assigned_user: {
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
      prisma.ticket.count({ where }),
    ]);

    return {
      items: tickets,
      pagination: { page, limit, total },
    };
  }

  async getTicketById(id: number, companyId: number) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, company_id: companyId },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        unit: true,
        assigned_user: true,
        creator: true,
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
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

    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    return ticket;
  }

  async createTicket(data: any, companyId: number, userId: number) {
    // Generate ticket number
    const ticketNo = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticket_no: ticketNo,
        type_id: data.type_id,
        status_id: data.status_id,
        description: data.description,
        tenant_id: data.tenant_id || null,
        landlord_id: data.landlord_id || null,
        unit_id: data.unit_id || null,
        assigned_to: data.assigned_to || null,
        company_id: companyId,
        created_by: userId,
      },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        unit: true,
        assigned_user: true,
        creator: true,
      },
    });

    return ticket;
  }

  async updateTicket(id: number, data: any, companyId: number) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, company_id: companyId },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        type_id: data.type_id !== undefined ? data.type_id : undefined,
        status_id: data.status_id !== undefined ? data.status_id : undefined,
        description: data.description !== undefined ? data.description : undefined,
        tenant_id: data.tenant_id !== undefined ? data.tenant_id : undefined,
        landlord_id: data.landlord_id !== undefined ? data.landlord_id : undefined,
        unit_id: data.unit_id !== undefined ? data.unit_id : undefined,
        assigned_to: data.assigned_to !== undefined ? data.assigned_to : undefined,
      },
      include: {
        type: true,
        status: true,
        tenant: true,
        landlord: true,
        unit: true,
        assigned_user: true,
        creator: true,
      },
    });

    return updated;
  }

  async deleteTicket(id: number, companyId: number) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, company_id: companyId },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return { success: true };
  }
}

