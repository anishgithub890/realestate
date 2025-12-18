import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

// Property Favorites
export class PropertyFavoritesService {
  async addFavorite(unitId: number, userId: number | null, leadId: number | null, email: string | null, notes: string, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    // Check if already favorited
    if (userId) {
      const existing = await prisma.unitFavorite.findUnique({
        where: {
          unit_id_user_id: {
            unit_id: unitId,
            user_id: userId,
          },
        },
      });

      if (existing) {
        throw new ValidationError('Unit already in favorites');
      }
    }

    if (leadId) {
      const existing = await prisma.unitFavorite.findUnique({
        where: {
          unit_id_lead_id: {
            unit_id: unitId,
            lead_id: leadId,
          },
        },
      });

      if (existing) {
        throw new ValidationError('Unit already in favorites');
      }
    }

    return prisma.unitFavorite.create({
      data: {
        unit_id: unitId,
        user_id: userId,
        lead_id: leadId,
        email: email,
        notes: notes,
      },
      include: {
        unit: {
          include: {
            building: true,
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async removeFavorite(unitId: number, userId: number | null, leadId: number | null, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const where: any = { unit_id: unitId };

    if (userId) {
      where.user_id = userId;
    } else if (leadId) {
      where.lead_id = leadId;
    } else {
      throw new ValidationError('Either user_id or lead_id is required');
    }

    await prisma.unitFavorite.deleteMany({ where });

    return { message: 'Removed from favorites' };
  }

  async getUserFavorites(userId: number, companyId: number, pagination: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const [favorites, total] = await Promise.all([
      prisma.unitFavorite.findMany({
        where: { user_id: userId },
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
              floor: true,
              unit_type: true,
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.unitFavorite.count({ where: { user_id: userId } }),
    ]);

    return { items: favorites, pagination: { page, limit, total } };
  }

  async getLeadFavorites(leadId: number, companyId: number) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, company_id: companyId },
    });

    if (!lead) throw new NotFoundError('Lead');

    return prisma.unitFavorite.findMany({
      where: { lead_id: leadId },
      include: {
        unit: {
          include: {
            building: true,
            floor: true,
            unit_type: true,
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

// Property Inspection
export class PropertyInspectionService {
  async getInspections(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.unit_id) where.unit_id = parseInt(filters.unit_id);
    if (filters.inspection_type) where.inspection_type = filters.inspection_type;
    if (filters.inspection_date_from) {
      where.inspection_date = { gte: new Date(filters.inspection_date_from) };
    }
    if (filters.inspection_date_to) {
      where.inspection_date = {
        ...where.inspection_date,
        lte: new Date(filters.inspection_date_to),
      };
    }

    const [inspections, total] = await Promise.all([
      prisma.propertyInspection.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.propertyInspection.count({ where }),
    ]);

    return { items: inspections, pagination: { page, limit, total } };
  }

  async createInspection(data: any, companyId: number, createdBy: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: data.unit_id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyInspection.create({
      data: {
        unit_id: data.unit_id,
        contract_id: data.contract_id || null,
        contract_type: data.contract_type || null,
        inspection_type: data.inspection_type,
        inspection_date: new Date(data.inspection_date),
        inspector_name: data.inspector_name,
        inspector_notes: data.inspector_notes,
        condition_rating: data.condition_rating ? parseInt(data.condition_rating) : null,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        defects_found: data.defects_found,
        recommendations: data.recommendations,
        company_id: companyId,
        created_by: createdBy,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async getUnitInspections(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyInspection.findMany({
      where: { unit_id: unitId, company_id: companyId },
      orderBy: { inspection_date: 'desc' },
    });
  }
}

// Property Valuation
export class PropertyValuationService {
  async getValuations(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.unit_id) where.unit_id = parseInt(filters.unit_id);
    if (filters.valuation_type) where.valuation_type = filters.valuation_type;

    const [valuations, total] = await Promise.all([
      prisma.propertyValuation.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
            },
          },
        },
      }),
      prisma.propertyValuation.count({ where }),
    ]);

    return { items: valuations, pagination: { page, limit, total } };
  }

  async createValuation(data: any, companyId: number, createdBy: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: data.unit_id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyValuation.create({
      data: {
        unit_id: data.unit_id,
        valuation_type: data.valuation_type,
        estimated_rent: data.estimated_rent ? parseFloat(data.estimated_rent) : null,
        estimated_sale: data.estimated_sale ? parseFloat(data.estimated_sale) : null,
        valuation_date: new Date(data.valuation_date),
        valuer_name: data.valuer_name,
        valuer_notes: data.valuer_notes,
        market_analysis: data.market_analysis,
        comparable_units: data.comparable_units ? JSON.stringify(data.comparable_units) : null,
        company_id: companyId,
        created_by: createdBy,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async getUnitValuations(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyValuation.findMany({
      where: { unit_id: unitId, company_id: companyId },
      orderBy: { valuation_date: 'desc' },
    });
  }
}

// Property Insurance
export class PropertyInsuranceService {
  async getInsurances(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.unit_id) where.unit_id = parseInt(filters.unit_id);
    if (filters.is_active !== undefined) where.is_active = filters.is_active === 'true';

    const [insurances, total] = await Promise.all([
      prisma.propertyInsurance.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
            },
          },
        },
      }),
      prisma.propertyInsurance.count({ where }),
    ]);

    return { items: insurances, pagination: { page, limit, total } };
  }

  async createInsurance(data: any, companyId: number, createdBy: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: data.unit_id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyInsurance.create({
      data: {
        unit_id: data.unit_id,
        insurance_type: data.insurance_type,
        insurance_provider: data.insurance_provider,
        policy_number: data.policy_number,
        coverage_amount: parseFloat(data.coverage_amount),
        premium_amount: parseFloat(data.premium_amount),
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        renewal_date: data.renewal_date ? new Date(data.renewal_date) : null,
        documents: data.documents ? JSON.stringify(data.documents) : null,
        company_id: companyId,
        created_by: createdBy,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async getUnitInsurances(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyInsurance.findMany({
      where: { unit_id: unitId, company_id: companyId },
      orderBy: { start_date: 'desc' },
    });
  }
}

// Property Maintenance History
export class PropertyMaintenanceHistoryService {
  async getMaintenanceHistory(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = { company_id: companyId };

    if (filters.unit_id) where.unit_id = parseInt(filters.unit_id);
    if (filters.maintenance_type) where.maintenance_type = filters.maintenance_type;

    const [history, total] = await Promise.all([
      prisma.propertyMaintenanceHistory.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
            },
          },
        },
      }),
      prisma.propertyMaintenanceHistory.count({ where }),
    ]);

    return { items: history, pagination: { page, limit, total } };
  }

  async createMaintenanceHistory(data: any, companyId: number, createdBy: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: data.unit_id, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyMaintenanceHistory.create({
      data: {
        unit_id: data.unit_id,
        maintenance_type: data.maintenance_type,
        description: data.description,
        cost: data.cost ? parseFloat(data.cost) : null,
        vendor_name: data.vendor_name,
        maintenance_date: new Date(data.maintenance_date),
        next_maintenance_date: data.next_maintenance_date ? new Date(data.next_maintenance_date) : null,
        documents: data.documents ? JSON.stringify(data.documents) : null,
        company_id: companyId,
        created_by: createdBy,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async getUnitMaintenanceHistory(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    return prisma.propertyMaintenanceHistory.findMany({
      where: { unit_id: unitId, company_id: companyId },
      orderBy: { maintenance_date: 'desc' },
    });
  }
}

// Property Notifications
export class PropertyNotificationService {
  async getNotifications(userId: number, companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);
    const where: any = {
      user_id: userId,
      company_id: companyId,
    };

    if (filters.is_read !== undefined) {
      where.is_read = filters.is_read === 'true';
    }

    if (filters.notification_type) {
      where.notification_type = filters.notification_type;
    }

    const [notifications, total] = await Promise.all([
      prisma.propertyNotification.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
          unit: {
            include: {
              building: true,
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.propertyNotification.count({ where }),
    ]);

    return { items: notifications, pagination: { page, limit, total } };
  }

  async markAsRead(notificationId: number, userId: number, companyId: number) {
    const notification = await prisma.propertyNotification.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
        company_id: companyId,
      },
    });

    if (!notification) throw new NotFoundError('Notification');

    return prisma.propertyNotification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: number, companyId: number) {
    await prisma.propertyNotification.updateMany({
      where: {
        user_id: userId,
        company_id: companyId,
        is_read: false,
      },
      data: { is_read: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: number, companyId: number) {
    const count = await prisma.propertyNotification.count({
      where: {
        user_id: userId,
        company_id: companyId,
        is_read: false,
      },
    });

    return { unread_count: count };
  }

  async createNotification(data: any, companyId: number) {
    return prisma.propertyNotification.create({
      data: {
        unit_id: data.unit_id || null,
        user_id: data.user_id || null,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        action_url: data.action_url || null,
        company_id: companyId,
      },
    });
  }
}

// Property Analytics
export class PropertyAnalyticsService {
  async trackView(unitId: number, companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.propertyAnalytics.upsert({
      where: {
        unit_id_date: {
          unit_id: unitId,
          date: today,
        },
      },
      update: {
        views_count: { increment: 1 },
      },
      create: {
        unit_id: unitId,
        date: today,
        views_count: 1,
        company_id: companyId,
      },
    });

    return { message: 'View tracked' };
  }

  async getUnitAnalytics(unitId: number, companyId: number, dateFrom: Date, dateTo: Date) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const analytics = await prisma.propertyAnalytics.findMany({
      where: {
        unit_id: unitId,
        company_id: companyId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate totals
    const totals = analytics.reduce(
      (acc, item) => ({
        views: acc.views + item.views_count,
        favorites: acc.favorites + item.favorites_count,
        inquiries: acc.inquiries + item.inquiries_count,
        viewings: acc.viewings + item.viewings_count,
        offers: acc.offers + item.offers_count,
      }),
      { views: 0, favorites: 0, inquiries: 0, viewings: 0, offers: 0 }
    );

    return {
      analytics,
      totals,
    };
  }

  async incrementMetric(unitId: number, metric: 'favorites' | 'inquiries' | 'viewings' | 'offers', companyId: number) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, company_id: companyId },
    });

    if (!unit) throw new NotFoundError('Unit');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricField = `${metric}_count` as 'favorites_count' | 'inquiries_count' | 'viewings_count' | 'offers_count';

    await prisma.propertyAnalytics.upsert({
      where: {
        unit_id_date: {
          unit_id: unitId,
          date: today,
        },
      },
      update: {
        [metricField]: { increment: 1 },
      },
      create: {
        unit_id: unitId,
        date: today,
        [metricField]: 1,
        company_id: companyId,
      },
    });

    return { message: `${metric} tracked` };
  }
}

