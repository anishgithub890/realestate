import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class LeadService {
  async getLeads(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { mobile_no: { contains: filters.search } },
        { whatsapp_no: { contains: filters.search } },
      ];
    }

    if (filters.status_id) {
      where.status_id = parseInt(filters.status_id);
    }

    if (filters.activity_source_id) {
      where.activity_source_id = parseInt(filters.activity_source_id);
    }

    if (filters.assigned_to) {
      where.assigned_to = parseInt(filters.assigned_to);
    }

    if (filters.property_type) {
      where.property_type = filters.property_type;
    }

    if (filters.interest_type) {
      where.interest_type = filters.interest_type;
    }

    if (filters.min_price) {
      where.min_price = { gte: parseFloat(filters.min_price) };
    }

    if (filters.max_price) {
      where.max_price = { lte: parseFloat(filters.max_price) };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          status: true,
          activity_source: true,
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
              email: true,
            },
          },
          preferred_areas: {
            include: {
              area: true,
            },
          },
          preferred_unit_types: {
            include: {
              unit_type: true,
            },
          },
          preferred_amenities: {
            include: {
              amenity: true,
            },
          },
          _count: {
            select: {
              followups: true,
              viewings: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      items: leads,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getLeadById(id: number, companyId: number) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        status: true,
        activity_source: true,
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
            email: true,
          },
        },
        preferred_areas: {
          include: {
            area: {
              include: {
                state: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
        preferred_unit_types: {
          include: {
            unit_type: true,
          },
        },
        preferred_amenities: {
          include: {
            amenity: true,
          },
        },
        followups: {
          include: {
            status: true,
            followup_type: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        viewings: {
          include: {
            unit: {
              include: {
                building: {
                  include: {
                    area: true,
                  },
                },
              },
            },
          },
          orderBy: {
            viewing_date: 'desc',
          },
        },
        favorites: {
          include: {
            unit: {
              include: {
                building: {
                  include: {
                    area: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            followups: true,
            viewings: true,
            favorites: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    return lead;
  }

  async createLead(data: any, companyId: number, createdBy: number) {
    // Validate activity source
    const activitySource = await prisma.activitySource.findFirst({
      where: {
        id: data.activity_source_id,
        company_id: companyId,
      },
    });

    if (!activitySource) {
      throw new NotFoundError('Activity Source');
    }

    // Validate assigned user if provided
    if (data.assigned_to) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: data.assigned_to,
          company_id: companyId,
        },
      });

      if (!assignedUser) {
        throw new NotFoundError('Assigned User');
      }
    }

    // Validate status if provided
    if (data.status_id) {
      const status = await prisma.leadStatus.findFirst({
        where: {
          id: data.status_id,
          company_id: companyId,
        },
      });

      if (!status) {
        throw new NotFoundError('Lead Status');
      }
    }

    // Validate preferred areas
    if (data.preferred_area_ids && data.preferred_area_ids.length > 0) {
      const areas = await prisma.area.findMany({
        where: {
          id: { in: data.preferred_area_ids },
          company_id: companyId,
        },
      });

      if (areas.length !== data.preferred_area_ids.length) {
        throw new ValidationError('One or more preferred areas not found');
      }
    }

    // Validate preferred unit types
    if (data.preferred_unit_type_ids && data.preferred_unit_type_ids.length > 0) {
      const unitTypes = await prisma.unitType.findMany({
        where: {
          id: { in: data.preferred_unit_type_ids },
          company_id: companyId,
        },
      });

      if (unitTypes.length !== data.preferred_unit_type_ids.length) {
        throw new ValidationError('One or more preferred unit types not found');
      }
    }

    // Validate preferred amenities
    if (data.preferred_amenity_ids && data.preferred_amenity_ids.length > 0) {
      const amenities = await prisma.amenity.findMany({
        where: {
          id: { in: data.preferred_amenity_ids },
          company_id: companyId,
        },
      });

      if (amenities.length !== data.preferred_amenity_ids.length) {
        throw new ValidationError('One or more preferred amenities not found');
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        mobile_no: data.mobile_no,
        whatsapp_no: data.whatsapp_no || null,
        property_type: data.property_type,
        interest_type: data.interest_type,
        min_price: parseFloat(data.min_price),
        max_price: parseFloat(data.max_price),
        description: data.description || null,
        address: data.address || null,
        activity_source_id: data.activity_source_id,
        assigned_to: data.assigned_to || null,
        status_id: data.status_id || null,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_term: data.utm_term || null,
        utm_content: data.utm_content || null,
        referrer_url: data.referrer_url || null,
        landing_page: data.landing_page || null,
        company_id: companyId,
        created_by: createdBy,
        preferred_areas: data.preferred_area_ids
          ? {
              create: data.preferred_area_ids.map((areaId: number) => ({
                area_id: areaId,
              })),
            }
          : undefined,
        preferred_unit_types: data.preferred_unit_type_ids
          ? {
              create: data.preferred_unit_type_ids.map((unitTypeId: number) => ({
                unit_type_id: unitTypeId,
              })),
            }
          : undefined,
        preferred_amenities: data.preferred_amenity_ids
          ? {
              create: data.preferred_amenity_ids.map((amenityId: number) => ({
                amenity_id: amenityId,
              })),
            }
          : undefined,
      },
      include: {
        status: true,
        activity_source: true,
        assigned_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        preferred_areas: {
          include: {
            area: true,
          },
        },
        preferred_unit_types: {
          include: {
            unit_type: true,
          },
        },
        preferred_amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    return lead;
  }

  async updateLead(id: number, data: any, companyId: number) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    // Validate activity source if provided
    if (data.activity_source_id) {
      const activitySource = await prisma.activitySource.findFirst({
        where: {
          id: data.activity_source_id,
          company_id: companyId,
        },
      });

      if (!activitySource) {
        throw new NotFoundError('Activity Source');
      }
    }

    // Validate assigned user if provided
    if (data.assigned_to !== undefined) {
      if (data.assigned_to) {
        const assignedUser = await prisma.user.findFirst({
          where: {
            id: data.assigned_to,
            company_id: companyId,
          },
        });

        if (!assignedUser) {
          throw new NotFoundError('Assigned User');
        }
      }
    }

    // Validate status if provided
    if (data.status_id !== undefined) {
      if (data.status_id) {
        const status = await prisma.leadStatus.findFirst({
          where: {
            id: data.status_id,
            company_id: companyId,
          },
        });

        if (!status) {
          throw new NotFoundError('Lead Status');
        }
      }
    }

    // Update lead
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.mobile_no !== undefined) updateData.mobile_no = data.mobile_no;
    if (data.whatsapp_no !== undefined) updateData.whatsapp_no = data.whatsapp_no;
    if (data.property_type !== undefined) updateData.property_type = data.property_type;
    if (data.interest_type !== undefined) updateData.interest_type = data.interest_type;
    if (data.min_price !== undefined) updateData.min_price = parseFloat(data.min_price);
    if (data.max_price !== undefined) updateData.max_price = parseFloat(data.max_price);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.activity_source_id !== undefined) updateData.activity_source_id = data.activity_source_id;
    if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;
    if (data.status_id !== undefined) updateData.status_id = data.status_id;
    if (data.utm_source !== undefined) updateData.utm_source = data.utm_source;
    if (data.utm_medium !== undefined) updateData.utm_medium = data.utm_medium;
    if (data.utm_campaign !== undefined) updateData.utm_campaign = data.utm_campaign;
    if (data.utm_term !== undefined) updateData.utm_term = data.utm_term;
    if (data.utm_content !== undefined) updateData.utm_content = data.utm_content;
    if (data.referrer_url !== undefined) updateData.referrer_url = data.referrer_url;
    if (data.landing_page !== undefined) updateData.landing_page = data.landing_page;

    await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    // Update preferred areas if provided
    if (data.preferred_area_ids !== undefined) {
      await prisma.leadPreferredArea.deleteMany({
        where: { lead_id: id },
      });

      if (data.preferred_area_ids.length > 0) {
        await prisma.leadPreferredArea.createMany({
          data: data.preferred_area_ids.map((areaId: number) => ({
            lead_id: id,
            area_id: areaId,
          })),
        });
      }
    }

    // Update preferred unit types if provided
    if (data.preferred_unit_type_ids !== undefined) {
      await prisma.leadPreferredunitType.deleteMany({
        where: { lead_id: id },
      });

      if (data.preferred_unit_type_ids.length > 0) {
        await prisma.leadPreferredunitType.createMany({
          data: data.preferred_unit_type_ids.map((unitTypeId: number) => ({
            lead_id: id,
            unit_type_id: unitTypeId,
          })),
        });
      }
    }

    // Update preferred amenities if provided
    if (data.preferred_amenity_ids !== undefined) {
      await prisma.leadPreferredAmenity.deleteMany({
        where: { lead_id: id },
      });

      if (data.preferred_amenity_ids.length > 0) {
        await prisma.leadPreferredAmenity.createMany({
          data: data.preferred_amenity_ids.map((amenityId: number) => ({
            lead_id: id,
            amenity_id: amenityId,
          })),
        });
      }
    }

    // Fetch updated lead with all relations
    return this.getLeadById(id, companyId);
  }

  async deleteLead(id: number, companyId: number) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    await prisma.lead.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }

  async assignLead(leadId: number, userId: number, companyId: number) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        company_id: companyId,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { assigned_to: userId },
      include: {
        assigned_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedLead;
  }

  async getLeadStats(companyId: number, filters: any) {
    const where: any = {
      company_id: companyId,
    };

    if (filters.date_from) {
      where.created_at = { gte: new Date(filters.date_from) };
    }

    if (filters.date_to) {
      where.created_at = {
        ...where.created_at,
        lte: new Date(filters.date_to),
      };
    }

    const [
      totalLeads,
      assignedLeads,
      unassignedLeads,
      leadsBySource,
      leadsByStatus,
      leadsByPropertyType,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({
        where: {
          ...where,
          assigned_to: { not: null },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          assigned_to: null,
        },
      }),
      prisma.lead.groupBy({
        by: ['activity_source_id'],
        where,
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['status_id'],
        where,
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['property_type'],
        where,
        _count: true,
      }),
    ]);

    // Fetch source names
    const sourceIds = leadsBySource.map((s) => s.activity_source_id);
    const sources = await prisma.activitySource.findMany({
      where: {
        id: { in: sourceIds },
        company_id: companyId,
      },
    });

    // Fetch status names
    const statusIds = leadsByStatus.filter((s) => s.status_id !== null).map((s) => s.status_id!);
    const statuses = statusIds.length > 0
      ? await prisma.leadStatus.findMany({
          where: {
            id: { in: statusIds },
            company_id: companyId,
          },
        })
      : [];

    return {
      total: totalLeads,
      assigned: assignedLeads,
      unassigned: unassignedLeads,
      by_source: leadsBySource.map((s) => ({
        source_id: s.activity_source_id,
        source_name: sources.find((src) => src.id === s.activity_source_id)?.name || 'Unknown',
        count: s._count,
      })),
      by_status: leadsByStatus.map((s) => ({
        status_id: s.status_id,
        status_name: s.status_id
          ? statuses.find((st) => st.id === s.status_id)?.name || 'Unknown'
          : 'No Status',
        count: s._count,
      })),
      by_property_type: leadsByPropertyType.map((pt) => ({
        property_type: pt.property_type,
        count: pt._count,
      })),
    };
  }
}

