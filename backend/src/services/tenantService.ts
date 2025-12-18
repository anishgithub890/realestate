import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class TenantService {
  async getTenants(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { mobile_no: { contains: filters.search } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          company: true,
          contracts: {
            take: 5,
            orderBy: { created_at: 'desc' },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      items: tenants,
      pagination: { page, limit, total },
    };
  }

  async getTenantById(id: number, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id, company_id: companyId },
      include: {
        company: true,
        contracts: {
          include: {
            units: {
              include: {
                unit: {
                  include: {
                    building: true,
                    floor: true,
                  },
                },
              },
            },
          },
        },
        kyc_documents: {
          include: {
            doc_type: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    return tenant;
  }

  async createTenant(data: any, companyId: number) {
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        email: data.email,
        phone_no: data.phone_no,
        mobile_no: data.mobile_no,
        emirates_id: data.emirates_id,
        emirates_id_expiry: data.emirates_id_expiry ? new Date(data.emirates_id_expiry) : null,
        residential: data.residential,
        nationality: data.nationality,
        passport_no: data.passport_no,
        passport_expiry: new Date(data.passport_expiry),
        fax: data.fax,
        address: data.address,
        company_id: companyId,
      },
      include: {
        company: true,
      },
    });

    return tenant;
  }

  async updateTenant(id: number, data: any, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const updateData: any = { ...data };
    if (data.emirates_id_expiry) {
      updateData.emirates_id_expiry = new Date(data.emirates_id_expiry);
    }
    if (data.passport_expiry) {
      updateData.passport_expiry = new Date(data.passport_expiry);
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    return updatedTenant;
  }

  async deleteTenant(id: number, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return { message: 'Tenant deleted successfully' };
  }

  async getTenantKyc(tenantId: number, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const documents = await prisma.kycDocument.findMany({
      where: { tenant_id: tenantId },
      include: {
        doc_type: true,
      },
    });

    return documents;
  }

  async uploadKycDocument(tenantId: number, docTypeId: number, filePath: string, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const document = await prisma.kycDocument.create({
      data: {
        tenant_id: tenantId,
        doc_type_id: docTypeId,
        path: filePath,
      },
      include: {
        doc_type: true,
      },
    });

    return document;
  }

  async getTenantContracts(tenantId: number, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const contracts = await prisma.rentalContract.findMany({
      where: { tenant_id: tenantId, company_id: companyId },
      include: {
        units: {
          include: {
            unit: {
              include: {
                building: true,
                floor: true,
              },
            },
          },
        },
        receipts: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return contracts;
  }

  async getTenantUnits(tenantId: number, companyId: number) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, company_id: companyId },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant');
    }

    const contracts = await prisma.rentalContract.findMany({
      where: {
        tenant_id: tenantId,
        company_id: companyId,
        to_date: { gte: new Date() },
      },
      include: {
        units: {
          include: {
            unit: {
              include: {
                building: true,
                floor: true,
                unit_type: true,
              },
            },
          },
        },
      },
    });

    const units = contracts.flatMap((contract) =>
      contract.units.map((cu) => cu.unit)
    );

    return units;
  }
}

