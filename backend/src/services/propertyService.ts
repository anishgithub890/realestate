import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class PropertyService {
  // Building Management
  async getBuildings(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.area_id) where.area_id = parseInt(filters.area_id);
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          area: {
            include: {
              state: {
                include: { country: true },
              },
            },
          },
          _count: {
            select: { units: true, floors: true },
          },
        },
      }),
      prisma.building.count({ where }),
    ]);

    return { items: buildings, pagination: { page, limit, total } };
  }

  async getBuildingById(id: number, companyId: number) {
    const building = await prisma.building.findFirst({
      where: { id, company_id: companyId },
      include: {
        area: {
          include: {
            state: {
              include: { country: true },
            },
          },
        },
        floors: {
          include: {
            _count: { select: { units: true } },
          },
        },
        units: {
          include: {
            unit_type: true,
            floor: true,
            landlord: true,
          },
        },
      },
    });

    if (!building) throw new NotFoundError('Building');
    return building;
  }

  async createBuilding(data: any, companyId: number) {
    return prisma.building.create({
      data: {
        name: data.name,
        completion_date: data.completion_date ? new Date(data.completion_date) : null,
        is_exempt: data.is_exempt || 'false',
        status: data.status || 'active',
        area_id: data.area_id,
        company_id: companyId,
      },
      include: {
        area: true,
      },
    });
  }

  async updateBuilding(id: number, data: any, companyId: number) {
    const building = await prisma.building.findFirst({
      where: { id, company_id: companyId },
    });

    if (!building) throw new NotFoundError('Building');

    const updateData: any = { ...data };
    if (data.completion_date) updateData.completion_date = new Date(data.completion_date);

    return prisma.building.update({
      where: { id },
      data: updateData,
      include: { area: true },
    });
  }

  async deleteBuilding(id: number, companyId: number) {
    const building = await prisma.building.findFirst({
      where: { id, company_id: companyId },
    });

    if (!building) throw new NotFoundError('Building');

    await prisma.building.delete({ where: { id } });
    return { message: 'Building deleted successfully' };
  }

  // Unit Management
  async getUnits(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.building_id) where.building_id = parseInt(filters.building_id);
    if (filters.floor_id) where.floor_id = parseInt(filters.floor_id);
    if (filters.unit_type_id) where.unit_type_id = parseInt(filters.unit_type_id);
    if (filters.status) where.status = filters.status;
    if (filters.property_type) where.property_type = filters.property_type;
    if (filters.min_price) where.basic_rent = { gte: parseFloat(filters.min_price) };
    if (filters.max_price) {
      where.basic_rent = { ...where.basic_rent, lte: parseFloat(filters.max_price) };
    }
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          building: true,
          floor: true,
          unit_type: true,
          landlord: true,
          amenities: {
            include: { amenity: true },
          },
        },
      }),
      prisma.unit.count({ where }),
    ]);

    return { items: units, pagination: { page, limit, total } };
  }

  async getAvailableUnits(companyId: number, filters: any) {
    const where: any = {
      company_id: companyId,
      status: 'available',
    };

    if (filters.building_id) where.building_id = parseInt(filters.building_id);
    if (filters.unit_type_id) where.unit_type_id = parseInt(filters.unit_type_id);
    if (filters.min_price) where.basic_rent = { gte: parseFloat(filters.min_price) };
    if (filters.max_price) {
      where.basic_rent = { ...where.basic_rent, lte: parseFloat(filters.max_price) };
    }

    return prisma.unit.findMany({
      where,
      include: {
        building: {
          include: { area: true },
        },
        floor: true,
        unit_type: true,
        amenities: {
          include: { amenity: true },
        },
      },
    });
  }

  async getUnitById(id: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id, company_id: companyId },
      include: {
        building: {
          include: {
            area: {
              include: {
                state: {
                  include: { country: true },
                },
              },
            },
          },
        },
        floor: true,
        unit_type: true,
        landlord: true,
        amenities: {
          include: { amenity: true },
        },
        rental_contracts: {
          include: {
            contract: {
              include: { tenant: true },
            },
          },
        },
      },
    });

    if (!unit) throw new NotFoundError('Unit');
    return unit;
  }

  async createUnit(data: any, companyId: number) {
    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        gross_area_in_sqft: parseFloat(data.gross_area_in_sqft),
        ownership: data.ownership,
        basic_rent: data.basic_rent ? parseFloat(data.basic_rent) : null,
        basic_sale_value: data.basic_sale_value ? parseFloat(data.basic_sale_value) : null,
        is_exempt: data.is_exempt || 'false',
        premise_no: data.premise_no,
        status: data.status || 'available',
        property_type: data.property_type,
        no_of_bathrooms: parseInt(data.no_of_bathrooms),
        no_of_parkings: data.no_of_parkings ? parseInt(data.no_of_parkings) : null,
        building_id: data.building_id,
        floor_id: data.floor_id,
        unit_type_id: data.unit_type_id,
        owned_by: data.owned_by || null,
        company_id: companyId,
        amenities: {
          create: (data.amenity_ids || []).map((aid: number) => ({
            amenity_id: aid,
          })),
        },
      },
      include: {
        building: true,
        floor: true,
        unit_type: true,
        amenities: {
          include: { amenity: true },
        },
      },
    });

    return unit;
  }

  async updateUnit(id: number, data: any, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const updateData: any = { ...data };
    if (data.basic_rent) updateData.basic_rent = parseFloat(data.basic_rent);
    if (data.basic_sale_value) updateData.basic_sale_value = parseFloat(data.basic_sale_value);
    if (data.gross_area_in_sqft) updateData.gross_area_in_sqft = parseFloat(data.gross_area_in_sqft);
    if (data.municipality_fees) updateData.municipality_fees = parseFloat(data.municipality_fees);
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);
    if (data.ejari_expiry) updateData.ejari_expiry = new Date(data.ejari_expiry);

    if (data.amenity_ids) {
      // Update amenities
      await prisma.unitAmenity.deleteMany({
        where: { unit_id: id },
      });
      updateData.amenities = {
        create: data.amenity_ids.map((aid: number) => ({
          amenity_id: aid,
        })),
      };
    }

    return prisma.unit.update({
      where: { id },
      data: updateData,
      include: {
        building: true,
        floor: true,
        unit_type: true,
        amenities: {
          include: { amenity: true },
        },
      },
    });
  }

  async deleteUnit(id: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    await prisma.unit.delete({ where: { id } });
    return { message: 'Unit deleted successfully' };
  }

  // Floor Management
  async getFloors(buildingId: number, companyId: number) {
    const building = await prisma.building.findFirst({
      where: { id: buildingId, company_id: companyId },
    });

    if (!building) throw new NotFoundError('Building');

    return prisma.floor.findMany({
      where: { building_id: buildingId },
      include: {
        _count: { select: { units: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createFloor(data: any, companyId: number) {
    const building = await prisma.building.findFirst({
      where: { id: data.building_id, company_id: companyId },
    });

    if (!building) throw new NotFoundError('Building');

    return prisma.floor.create({
      data: {
        name: data.name,
        building_id: data.building_id,
      },
    });
  }

  // Unit Type Management
  async getUnitTypes(companyId: number) {
    return prisma.unitType.findMany({
      where: { company_id: companyId },
      include: {
        _count: { select: { units: true } },
      },
    });
  }

  async createUnitType(data: any, companyId: number) {
    return prisma.unitType.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  // Amenity Management
  async getAmenities(companyId: number) {
    return prisma.amenity.findMany({
      where: { company_id: companyId },
    });
  }

  async createAmenity(data: any, companyId: number) {
    return prisma.amenity.create({
      data: {
        name: data.name,
        company_id: companyId,
      },
    });
  }

  // Parking Management
  async getParkings(companyId: number, buildingId?: number) {
    const where: any = { company_id: companyId };
    if (buildingId) where.building_id = buildingId;

    return prisma.parking.findMany({
      where,
      include: {
        building: true,
      },
    });
  }

  async createParking(data: any, companyId: number) {
    return prisma.parking.create({
      data: {
        name: data.name,
        building_id: data.building_id,
        company_id: companyId,
      },
      include: {
        building: true,
      },
    });
  }

  // Unit Images Management
  async getUnitImages(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.unitImage.findMany({
      where: { unit_id: unitId },
      orderBy: [
        { is_primary: 'desc' },
        { display_order: 'asc' },
      ],
    });
  }

  async addUnitImage(unitId: number, imageUrl: string, imageType: string, caption: string, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    // If this is set as primary, unset other primary images
    if (imageType === 'main') {
      await prisma.unitImage.updateMany({
        where: { unit_id: unitId, is_primary: true },
        data: { is_primary: false },
      });
    }

    // Get max display order
    const maxOrder = await prisma.unitImage.findFirst({
      where: { unit_id: unitId },
      orderBy: { display_order: 'desc' },
      select: { display_order: true },
    });

    const image = await prisma.unitImage.create({
      data: {
        unit_id: unitId,
        image_url: imageUrl,
        image_type: imageType,
        caption: caption,
        display_order: (maxOrder?.display_order || 0) + 1,
        is_primary: imageType === 'main',
      },
    });

    return image;
  }

  async updateUnitImage(imageId: number, unitId: number, data: any, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const image = await prisma.unitImage.findFirst({
      where: { id: imageId, unit_id: unitId },
    });

    if (!image) throw new NotFoundError('Image');

    // If setting as primary, unset others
    if (data.is_primary === true) {
      await prisma.unitImage.updateMany({
        where: { unit_id: unitId, is_primary: true, id: { not: imageId } },
        data: { is_primary: false },
      });
    }

    return prisma.unitImage.update({
      where: { id: imageId },
      data,
    });
  }

  async deleteUnitImage(imageId: number, unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    await prisma.unitImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  async reorderUnitImages(unitId: number, imageIds: number[], companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    // Update display order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await prisma.unitImage.update({
        where: { id: imageIds[i] },
        data: { display_order: i + 1 },
      });
    }

    return { message: 'Images reordered successfully' };
  }

  // Unit Documents Management
  async getUnitDocuments(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.unitDocument.findMany({
      where: { unit_id: unitId },
      orderBy: { created_at: 'desc' },
    });
  }

  async addUnitDocument(unitId: number, docType: string, documentUrl: string, documentName: string, expiryDate: Date | null, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.unitDocument.create({
      data: {
        unit_id: unitId,
        doc_type: docType,
        document_url: documentUrl,
        document_name: documentName,
        expiry_date: expiryDate,
      },
    });
  }

  async deleteUnitDocument(docId: number, unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    await prisma.unitDocument.delete({
      where: { id: docId },
    });

    return { message: 'Document deleted successfully' };
  }
}

