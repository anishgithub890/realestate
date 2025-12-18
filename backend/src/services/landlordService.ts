import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class LandlordService {
  async getLandlords(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { mobile_no: { contains: filters.search } },
      ];
    }

    const [landlords, total] = await Promise.all([
      prisma.landlord.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          company: true,
          units: { take: 5 },
        },
      }),
      prisma.landlord.count({ where }),
    ]);

    return { items: landlords, pagination: { page, limit, total } };
  }

  async getLandlordById(id: number, companyId: number) {
    const landlord = await prisma.landlord.findFirst({
      where: { id, company_id: companyId },
      include: {
        company: true,
        units: {
          include: {
            building: true,
            floor: true,
          },
        },
        kyc_documents: {
          include: { doc_type: true },
        },
        sales_contracts: {
          include: {
            units: {
              include: { unit: true },
            },
          },
        },
      },
    });

    if (!landlord) throw new NotFoundError('Landlord');
    return landlord;
  }

  async createLandlord(data: any, companyId: number) {
    return prisma.landlord.create({
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
      include: { company: true },
    });
  }

  async updateLandlord(id: number, data: any, companyId: number) {
    const landlord = await prisma.landlord.findFirst({
      where: { id, company_id: companyId },
    });

    if (!landlord) throw new NotFoundError('Landlord');

    const updateData: any = { ...data };
    if (data.emirates_id_expiry) updateData.emirates_id_expiry = new Date(data.emirates_id_expiry);
    if (data.passport_expiry) updateData.passport_expiry = new Date(data.passport_expiry);

    return prisma.landlord.update({
      where: { id },
      data: updateData,
      include: { company: true },
    });
  }

  async deleteLandlord(id: number, companyId: number) {
    const landlord = await prisma.landlord.findFirst({
      where: { id, company_id: companyId },
    });

    if (!landlord) throw new NotFoundError('Landlord');

    await prisma.landlord.delete({ where: { id } });
    return { message: 'Landlord deleted successfully' };
  }

  async getLandlordKyc(landlordId: number, companyId: number) {
    const landlord = await prisma.landlord.findFirst({
      where: { id: landlordId, company_id: companyId },
    });

    if (!landlord) throw new NotFoundError('Landlord');

    return prisma.kycDocument.findMany({
      where: { landlord_id: landlordId },
      include: { doc_type: true },
    });
  }

  async getLandlordUnits(landlordId: number, companyId: number) {
    const landlord = await prisma.landlord.findFirst({
      where: { id: landlordId, company_id: companyId },
    });

    if (!landlord) throw new NotFoundError('Landlord');

    return prisma.unit.findMany({
      where: { owned_by: landlordId, company_id: companyId },
      include: {
        building: true,
        floor: true,
        unit_type: true,
      },
    });
  }
}

