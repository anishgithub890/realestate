import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class MasterDataService {
  // Countries
  async getCountries(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.country.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: {
            select: { states: true },
          },
        },
      }),
      prisma.country.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createCountry(data: any, companyId: number) {
    return prisma.country.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateCountry(id: number, data: any, companyId: number) {
    const country = await prisma.country.findFirst({
      where: { id, company_id: companyId },
    });
    if (!country) throw new NotFoundError('Country');

    return prisma.country.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteCountry(id: number, companyId: number) {
    const country = await prisma.country.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { states: true } } },
    });
    if (!country) throw new NotFoundError('Country');
    if (country._count.states > 0) {
      throw new Error('Cannot delete country with associated states');
    }

    await prisma.country.delete({ where: { id } });
    return { success: true };
  }

  // States
  async getStates(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { authorative_name: { contains: filters.search } },
      ];
    }
    if (filters.country_id) {
      where.country_id = parseInt(filters.country_id);
    }

    const [items, total] = await Promise.all([
      prisma.state.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          country: { select: { id: true, name: true } },
          _count: { select: { areas: true } },
        },
      }),
      prisma.state.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createState(data: any, companyId: number) {
    return prisma.state.create({
      data: {
        name: data.name,
        authorative_name: data.authorative_name || null,
        country_id: data.country_id,
        company_id: companyId,
      },
      include: {
        country: { select: { id: true, name: true } },
      },
    });
  }

  async updateState(id: number, data: any, companyId: number) {
    const state = await prisma.state.findFirst({
      where: { id, company_id: companyId },
    });
    if (!state) throw new NotFoundError('State');

    return prisma.state.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        authorative_name: data.authorative_name !== undefined ? data.authorative_name : undefined,
        country_id: data.country_id !== undefined ? data.country_id : undefined,
      },
      include: {
        country: { select: { id: true, name: true } },
      },
    });
  }

  async deleteState(id: number, companyId: number) {
    const state = await prisma.state.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { areas: true } } },
    });
    if (!state) throw new NotFoundError('State');
    if (state._count.areas > 0) {
      throw new Error('Cannot delete state with associated areas');
    }

    await prisma.state.delete({ where: { id } });
    return { success: true };
  }

  // Areas
  async getAreas(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }
    if (filters.state_id) {
      where.state_id = parseInt(filters.state_id);
    }

    const [items, total] = await Promise.all([
      prisma.area.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          state: {
            include: {
              country: { select: { id: true, name: true } },
            },
          },
          _count: { select: { buildings: true } },
        },
      }),
      prisma.area.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createArea(data: any, companyId: number) {
    return prisma.area.create({
      data: {
        name: data.name,
        state_id: data.state_id,
        company_id: companyId,
      },
      include: {
        state: {
          include: {
            country: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async updateArea(id: number, data: any, companyId: number) {
    const area = await prisma.area.findFirst({
      where: { id, company_id: companyId },
    });
    if (!area) throw new NotFoundError('Area');

    return prisma.area.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        state_id: data.state_id !== undefined ? data.state_id : undefined,
      },
      include: {
        state: {
          include: {
            country: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async deleteArea(id: number, companyId: number) {
    const area = await prisma.area.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { buildings: true } } },
    });
    if (!area) throw new NotFoundError('Area');
    if (area._count.buildings > 0) {
      throw new Error('Cannot delete area with associated buildings');
    }

    await prisma.area.delete({ where: { id } });
    return { success: true };
  }

  // Unit Types
  async getUnitTypes(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.unitType.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { units: true } },
        },
      }),
      prisma.unitType.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createUnitType(data: any, companyId: number) {
    return prisma.unitType.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateUnitType(id: number, data: any, companyId: number) {
    const unitType = await prisma.unitType.findFirst({
      where: { id, company_id: companyId },
    });
    if (!unitType) throw new NotFoundError('Unit Type');

    return prisma.unitType.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteUnitType(id: number, companyId: number) {
    const unitType = await prisma.unitType.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { units: true } } },
    });
    if (!unitType) throw new NotFoundError('Unit Type');
    if (unitType._count.units > 0) {
      throw new Error('Cannot delete unit type with associated units');
    }

    await prisma.unitType.delete({ where: { id } });
    return { success: true };
  }

  // Amenities
  async getAmenities(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.amenity.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { unit_amenities: true } },
        },
      }),
      prisma.amenity.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createAmenity(data: any, companyId: number) {
    return prisma.amenity.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateAmenity(id: number, data: any, companyId: number) {
    const amenity = await prisma.amenity.findFirst({
      where: { id, company_id: companyId },
    });
    if (!amenity) throw new NotFoundError('Amenity');

    return prisma.amenity.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteAmenity(id: number, companyId: number) {
    const amenity = await prisma.amenity.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { unit_amenities: true } } },
    });
    if (!amenity) throw new NotFoundError('Amenity');
    if (amenity._count.unit_amenities > 0) {
      throw new Error('Cannot delete amenity with associated units');
    }

    await prisma.amenity.delete({ where: { id } });
    return { success: true };
  }

  // Maintenance Types
  async getMaintenanceTypes(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceType.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { tickets: true } },
        },
      }),
      prisma.maintenanceType.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createMaintenanceType(data: any, companyId: number) {
    return prisma.maintenanceType.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateMaintenanceType(id: number, data: any, companyId: number) {
    const type = await prisma.maintenanceType.findFirst({
      where: { id, company_id: companyId },
    });
    if (!type) throw new NotFoundError('Maintenance Type');

    return prisma.maintenanceType.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteMaintenanceType(id: number, companyId: number) {
    const type = await prisma.maintenanceType.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { tickets: true } } },
    });
    if (!type) throw new NotFoundError('Maintenance Type');
    if (type._count.tickets > 0) {
      throw new Error('Cannot delete maintenance type with associated tickets');
    }

    await prisma.maintenanceType.delete({ where: { id } });
    return { success: true };
  }

  // Maintenance Statuses
  async getMaintenanceStatuses(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceStatus.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { tickets: true, followups: true } },
        },
      }),
      prisma.maintenanceStatus.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createMaintenanceStatus(data: any, companyId: number) {
    return prisma.maintenanceStatus.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateMaintenanceStatus(id: number, data: any, companyId: number) {
    const status = await prisma.maintenanceStatus.findFirst({
      where: { id, company_id: companyId },
    });
    if (!status) throw new NotFoundError('Maintenance Status');

    return prisma.maintenanceStatus.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteMaintenanceStatus(id: number, companyId: number) {
    const status = await prisma.maintenanceStatus.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { tickets: true, followups: true } } },
    });
    if (!status) throw new NotFoundError('Maintenance Status');
    if (status._count.tickets > 0 || status._count.followups > 0) {
      throw new Error('Cannot delete maintenance status with associated tickets or followups');
    }

    await prisma.maintenanceStatus.delete({ where: { id } });
    return { success: true };
  }

  // Complaint Statuses
  async getComplaintStatuses(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.complaintStatus.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { complaints: true, followups: true } },
        },
      }),
      prisma.complaintStatus.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createComplaintStatus(data: any, companyId: number) {
    return prisma.complaintStatus.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateComplaintStatus(id: number, data: any, companyId: number) {
    const status = await prisma.complaintStatus.findFirst({
      where: { id, company_id: companyId },
    });
    if (!status) throw new NotFoundError('Complaint Status');

    return prisma.complaintStatus.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteComplaintStatus(id: number, companyId: number) {
    const status = await prisma.complaintStatus.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { complaints: true, followups: true } } },
    });
    if (!status) throw new NotFoundError('Complaint Status');
    if (status._count.complaints > 0 || status._count.followups > 0) {
      throw new Error('Cannot delete complaint status with associated complaints or followups');
    }

    await prisma.complaintStatus.delete({ where: { id } });
    return { success: true };
  }

  // Lead Statuses
  async getLeadStatuses(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { category: { contains: filters.search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.leadStatus.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { leads: true } },
        },
      }),
      prisma.leadStatus.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createLeadStatus(data: any, companyId: number) {
    return prisma.leadStatus.create({
      data: {
        name: data.name,
        category: data.category || 'new',
        company_id: companyId,
      },
    });
  }

  async updateLeadStatus(id: number, data: any, companyId: number) {
    const status = await prisma.leadStatus.findFirst({
      where: { id, company_id: companyId },
    });
    if (!status) throw new NotFoundError('Lead Status');

    return prisma.leadStatus.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        category: data.category !== undefined ? data.category : undefined,
      },
    });
  }

  async deleteLeadStatus(id: number, companyId: number) {
    const status = await prisma.leadStatus.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { leads: true } } },
    });
    if (!status) throw new NotFoundError('Lead Status');
    if (status._count.leads > 0) {
      throw new Error('Cannot delete lead status with associated leads');
    }

    await prisma.leadStatus.delete({ where: { id } });
    return { success: true };
  }

  // Activity Sources
  async getActivitySources(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.activitySource.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { leads: true } },
        },
      }),
      prisma.activitySource.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createActivitySource(data: any, companyId: number) {
    return prisma.activitySource.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateActivitySource(id: number, data: any, companyId: number) {
    const source = await prisma.activitySource.findFirst({
      where: { id, company_id: companyId },
    });
    if (!source) throw new NotFoundError('Activity Source');

    return prisma.activitySource.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteActivitySource(id: number, companyId: number) {
    const source = await prisma.activitySource.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { leads: true } } },
    });
    if (!source) throw new NotFoundError('Activity Source');
    if (source._count.leads > 0) {
      throw new Error('Cannot delete activity source with associated leads');
    }

    await prisma.activitySource.delete({ where: { id } });
    return { success: true };
  }

  // Followup Types
  async getFollowupTypes(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.followupType.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { followups: true } },
        },
      }),
      prisma.followupType.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createFollowupType(data: any, companyId: number) {
    return prisma.followupType.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateFollowupType(id: number, data: any, companyId: number) {
    const type = await prisma.followupType.findFirst({
      where: { id, company_id: companyId },
    });
    if (!type) throw new NotFoundError('Followup Type');

    return prisma.followupType.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteFollowupType(id: number, companyId: number) {
    const type = await prisma.followupType.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { followups: true } } },
    });
    if (!type) throw new NotFoundError('Followup Type');
    if (type._count.followups > 0) {
      throw new Error('Cannot delete followup type with associated followups');
    }

    await prisma.followupType.delete({ where: { id } });
    return { success: true };
  }

  // Request Types
  async getRequestTypes(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.requestType.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { requests: true } },
        },
      }),
      prisma.requestType.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createRequestType(data: any, companyId: number) {
    return prisma.requestType.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateRequestType(id: number, data: any, companyId: number) {
    const type = await prisma.requestType.findFirst({
      where: { id, company_id: companyId },
    });
    if (!type) throw new NotFoundError('Request Type');

    return prisma.requestType.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteRequestType(id: number, companyId: number) {
    const type = await prisma.requestType.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { requests: true } } },
    });
    if (!type) throw new NotFoundError('Request Type');
    if (type._count.requests > 0) {
      throw new Error('Cannot delete request type with associated requests');
    }

    await prisma.requestType.delete({ where: { id } });
    return { success: true };
  }

  // Request Statuses
  async getRequestStatuses(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.requestStatus.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { requests: true } },
        },
      }),
      prisma.requestStatus.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createRequestStatus(data: any, companyId: number) {
    return prisma.requestStatus.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  async updateRequestStatus(id: number, data: any, companyId: number) {
    const status = await prisma.requestStatus.findFirst({
      where: { id, company_id: companyId },
    });
    if (!status) throw new NotFoundError('Request Status');

    return prisma.requestStatus.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async deleteRequestStatus(id: number, companyId: number) {
    const status = await prisma.requestStatus.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { requests: true } } },
    });
    if (!status) throw new NotFoundError('Request Status');
    if (status._count.requests > 0) {
      throw new Error('Cannot delete request status with associated requests');
    }

    await prisma.requestStatus.delete({ where: { id } });
    return { success: true };
  }

  // KYC Document Types
  async getKycDocTypes(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [items, total] = await Promise.all([
      prisma.kycDocType.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'name', sortOrder || 'asc'),
        include: {
          _count: { select: { documents: true } },
        },
      }),
      prisma.kycDocType.count({ where }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async createKycDocType(data: any, companyId: number) {
    return prisma.kycDocType.create({
      data: {
        name: data.name,
        is_mandatory: data.is_mandatory || 'false',
        company_id: companyId,
      },
    });
  }

  async updateKycDocType(id: number, data: any, companyId: number) {
    const docType = await prisma.kycDocType.findFirst({
      where: { id, company_id: companyId },
    });
    if (!docType) throw new NotFoundError('KYC Document Type');

    return prisma.kycDocType.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        is_mandatory: data.is_mandatory !== undefined ? data.is_mandatory : undefined,
      },
    });
  }

  async deleteKycDocType(id: number, companyId: number) {
    const docType = await prisma.kycDocType.findFirst({
      where: { id, company_id: companyId },
      include: { _count: { select: { documents: true } } },
    });
    if (!docType) throw new NotFoundError('KYC Document Type');
    if (docType._count.documents > 0) {
      throw new Error('Cannot delete KYC document type with associated documents');
    }

    await prisma.kycDocType.delete({ where: { id } });
    return { success: true };
  }
}

