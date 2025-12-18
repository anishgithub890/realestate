import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class BrokerService {
  async getBrokers(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true';
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { license_number: { contains: filters.search } },
      ];
    }

    const [brokers, total] = await Promise.all([
      prisma.broker.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          _count: {
            select: {
              rental_contracts: true,
              sales_contracts: true,
            },
          },
        },
      }),
      prisma.broker.count({ where }),
    ]);

    return { items: brokers, pagination: { page, limit, total } };
  }

  async getBrokerById(id: number, companyId: number) {
    const broker = await prisma.broker.findFirst({
      where: { id, company_id: companyId },
      include: {
        rental_contracts: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            tenant: true,
            units: {
              include: { unit: true },
            },
          },
        },
        sales_contracts: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            seller: true,
            buyer: true,
            units: {
              include: { unit: true },
            },
          },
        },
        _count: {
          select: {
            rental_contracts: true,
            sales_contracts: true,
          },
        },
      },
    });

    if (!broker) throw new NotFoundError('Broker');
    return broker;
  }

  async createBroker(data: any, companyId: number) {
    // Check if email already exists
    if (data.email) {
      const existing = await prisma.broker.findFirst({
        where: {
          email: data.email,
          company_id: companyId,
        },
      });

      if (existing) {
        throw new ConflictError('Broker with this email already exists');
      }
    }

    return prisma.broker.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        license_number: data.license_number,
        license_expiry: data.license_expiry ? new Date(data.license_expiry) : null,
        commission_rate: data.commission_rate ? parseFloat(data.commission_rate) : null,
        company_id: companyId,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });
  }

  async updateBroker(id: number, data: any, companyId: number) {
    const broker = await prisma.broker.findFirst({
      where: { id, company_id: companyId },
    });

    if (!broker) throw new NotFoundError('Broker');

    // Check email uniqueness if changing
    if (data.email && data.email !== broker.email) {
      const existing = await prisma.broker.findFirst({
        where: {
          email: data.email,
          company_id: companyId,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictError('Broker with this email already exists');
      }
    }

    const updateData: any = { ...data };
    if (data.license_expiry) updateData.license_expiry = new Date(data.license_expiry);
    if (data.commission_rate) updateData.commission_rate = parseFloat(data.commission_rate);

    return prisma.broker.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBroker(id: number, companyId: number) {
    const broker = await prisma.broker.findFirst({
      where: { id, company_id: companyId },
      include: {
        _count: {
          select: {
            rental_contracts: true,
            sales_contracts: true,
          },
        },
      },
    });

    if (!broker) throw new NotFoundError('Broker');

    if (broker._count.rental_contracts > 0 || broker._count.sales_contracts > 0) {
      throw new ConflictError('Cannot delete broker with associated contracts');
    }

    await prisma.broker.delete({
      where: { id },
    });

    return { message: 'Broker deleted successfully' };
  }

  async getBrokerStats(id: number, companyId: number) {
    const broker = await prisma.broker.findFirst({
      where: { id, company_id: companyId },
    });

    if (!broker) throw new NotFoundError('Broker');

    const [rentalContracts, salesContracts] = await Promise.all([
      prisma.rentalContract.findMany({
        where: { broker_id: id },
        select: {
          amount: true,
          broker_commission: true,
          commission_paid: true,
        },
      }),
      prisma.salesContract.findMany({
        where: { broker_id: id },
        select: {
          amount: true,
          broker_commission: true,
          commission_paid: true,
        },
      }),
    ]);

    const totalRentalCommission = rentalContracts.reduce((sum, c) => sum + (c.broker_commission || 0), 0);
    const totalSalesCommission = salesContracts.reduce((sum, c) => sum + (c.broker_commission || 0), 0);
    const paidRentalCommission = rentalContracts
      .filter((c) => c.commission_paid)
      .reduce((sum, c) => sum + (c.broker_commission || 0), 0);
    const paidSalesCommission = salesContracts
      .filter((c) => c.commission_paid)
      .reduce((sum, c) => sum + (c.broker_commission || 0), 0);

    return {
      total_contracts: rentalContracts.length + salesContracts.length,
      rental_contracts: rentalContracts.length,
      sales_contracts: salesContracts.length,
      total_commission: totalRentalCommission + totalSalesCommission,
      paid_commission: paidRentalCommission + paidSalesCommission,
      pending_commission: totalRentalCommission + totalSalesCommission - paidRentalCommission - paidSalesCommission,
    };
  }
}

