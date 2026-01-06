import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { cache } from '../config/redis';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class AnalyticsService {
  /**
   * Get lead source performance
   */
  async getLeadSourcePerformance(companyId: number, dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      company_id: companyId,
    };

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = dateFrom;
      if (dateTo) where.created_at.lte = dateTo;
    }

    // Get leads grouped by activity source
    const leadsBySource = await prisma.lead.groupBy({
      by: ['activity_source_id'],
      where,
      _count: true,
    });

    // Get activity sources
    const sourceIds = leadsBySource.map((s) => s.activity_source_id);
    const sources = await prisma.activitySource.findMany({
      where: {
        id: { in: sourceIds },
        company_id: companyId,
      },
    });

    // Get converted leads (leads with qualified status)
    const qualifiedStatuses = await prisma.leadStatus.findMany({
      where: {
        company_id: companyId,
        is_qualified: true,
      },
    });

    const qualifiedStatusIds = qualifiedStatuses.map((s) => s.id);

    // Calculate conversions per source
    const conversionsBySource = await Promise.all(
      leadsBySource.map(async (source) => {
        const convertedCount = await prisma.lead.count({
          where: {
            ...where,
            activity_source_id: source.activity_source_id,
            status_id: { in: qualifiedStatusIds },
          },
        });

        return {
          source_id: source.activity_source_id,
          converted_count: convertedCount,
        };
      })
    );

    // Get campaign costs
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        company_id: companyId,
        is_active: true,
      },
    });

    // Calculate performance metrics
    const performance = leadsBySource.map((source) => {
      const sourceName = sources.find((s) => s.id === source.activity_source_id)?.name || 'Unknown';
      const conversions = conversionsBySource.find((c) => c.source_id === source.activity_source_id)?.converted_count || 0;
      const conversionRate = source._count > 0 ? (conversions / source._count) * 100 : 0;

      // Find related campaign
      const campaign = campaigns.find((c) => c.source === sourceName.toLowerCase());
      const cost = campaign?.spent || 0;
      const roi = cost > 0 ? ((conversions * 1000 - cost) / cost) * 100 : 0; // Assuming 1000 per conversion

      return {
        source_id: source.activity_source_id,
        source_name: sourceName,
        leads_count: source._count,
        converted_count: conversions,
        conversion_rate: parseFloat(conversionRate.toFixed(2)),
        cost: cost,
        roi: parseFloat(roi.toFixed(2)),
      };
    });

    return performance;
  }

  /**
   * Get conversion funnel
   */
  async getConversionFunnel(companyId: number, dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      company_id: companyId,
    };

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = dateFrom;
      if (dateTo) where.created_at.lte = dateTo;
    }

    const [
      totalLeads,
      assignedLeads,
      contactedLeads,
      viewedProperties,
      madeOffers,
      convertedLeads,
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
          followups: {
            some: {},
          },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          viewings: {
            some: {},
          },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          status: {
            name: {
              contains: 'offer',
            },
          },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          status: {
            is_qualified: true,
          },
        },
      }),
    ]);

    return {
      total_leads: totalLeads,
      assigned: assignedLeads,
      contacted: contactedLeads,
      viewed_properties: viewedProperties,
      made_offers: madeOffers,
      converted: convertedLeads,
      stages: [
        { stage: 'Total Leads', count: totalLeads, percentage: 100 },
        { stage: 'Assigned', count: assignedLeads, percentage: totalLeads > 0 ? (assignedLeads / totalLeads) * 100 : 0 },
        { stage: 'Contacted', count: contactedLeads, percentage: totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0 },
        { stage: 'Viewed Properties', count: viewedProperties, percentage: totalLeads > 0 ? (viewedProperties / totalLeads) * 100 : 0 },
        { stage: 'Made Offers', count: madeOffers, percentage: totalLeads > 0 ? (madeOffers / totalLeads) * 100 : 0 },
        { stage: 'Converted', count: convertedLeads, percentage: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0 },
      ],
    };
  }

  /**
   * Calculate ROI for a campaign
   */
  async calculateROI(campaignId: number, companyId: number) {
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        id: campaignId,
        company_id: companyId,
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    // Get leads from this campaign source
    const source = await prisma.activitySource.findFirst({
      where: {
        company_id: companyId,
        name: campaign.source,
      },
    });

    if (!source) {
      return {
        campaign_id: campaignId,
        campaign_name: campaign.campaign_name,
        spent: campaign.spent,
        leads_count: campaign.leads_count,
        conversions: campaign.conversions,
        roi: 0,
        revenue: 0,
      };
    }

    // Get qualified leads
    const qualifiedStatuses = await prisma.leadStatus.findMany({
      where: {
        company_id: companyId,
        is_qualified: true,
      },
    });

    const qualifiedStatusIds = qualifiedStatuses.map((s) => s.id);

    const convertedLeads = await prisma.lead.count({
      where: {
        company_id: companyId,
        activity_source_id: source.id,
        status_id: { in: qualifiedStatusIds },
        created_at: {
          gte: campaign.start_date,
          lte: campaign.end_date || new Date(),
        },
      },
    });

    // Calculate revenue (assuming average deal value)
    const averageDealValue = 50000; // AED 50,000 average
    const revenue = convertedLeads * averageDealValue;
    const roi = campaign.spent > 0 ? ((revenue - campaign.spent) / campaign.spent) * 100 : 0;

    return {
      campaign_id: campaignId,
      campaign_name: campaign.campaign_name,
      spent: campaign.spent,
      leads_count: campaign.leads_count,
      conversions: convertedLeads,
      revenue: revenue,
      roi: parseFloat(roi.toFixed(2)),
    };
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard(companyId: number) {
    const cacheKey = `dashboard:${companyId}:${new Date().toISOString().split('T')[0]}`;
    
    // Try to get from cache first
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayLeads,
      weekLeads,
      monthLeads,
      totalLeads,
      unassignedLeads,
      todayConversions,
      weekConversions,
      monthConversions,
      topSources,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.count({
        where: {
          company_id: companyId,
          created_at: { gte: todayStart },
        },
      }),
      prisma.lead.count({
        where: {
          company_id: companyId,
          created_at: { gte: thisWeekStart },
        },
      }),
      prisma.lead.count({
        where: {
          company_id: companyId,
          created_at: { gte: thisMonthStart },
        },
      }),
      prisma.lead.count({
        where: { company_id: companyId },
      }),
      prisma.lead.count({
        where: {
          company_id: companyId,
          assigned_to: null,
        },
      }),
      this.getConversionsCount(companyId, todayStart),
      this.getConversionsCount(companyId, thisWeekStart),
      this.getConversionsCount(companyId, thisMonthStart),
      this.getTopSources(companyId, 5),
      prisma.lead.findMany({
        where: { company_id: companyId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          activity_source: true,
          assigned_user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const dashboard = {
      leads: {
        today: todayLeads,
        this_week: weekLeads,
        this_month: monthLeads,
        total: totalLeads,
        unassigned: unassignedLeads,
      },
      conversions: {
        today: todayConversions,
        this_week: weekConversions,
        this_month: monthConversions,
      },
      top_sources: topSources,
      recent_leads: recentLeads,
      timestamp: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, dashboard, 300);

    return dashboard;
  }

  /**
   * Get conversions count
   */
  private async getConversionsCount(companyId: number, dateFrom: Date): Promise<number> {
    const qualifiedStatuses = await prisma.leadStatus.findMany({
      where: {
        company_id: companyId,
        is_qualified: true,
      },
    });

    const qualifiedStatusIds = qualifiedStatuses.map((s) => s.id);

    return prisma.lead.count({
      where: {
        company_id: companyId,
        status_id: { in: qualifiedStatusIds },
        created_at: { gte: dateFrom },
      },
    });
  }

  /**
   * Get top lead sources
   */
  private async getTopSources(companyId: number, limit: number = 5) {
    const leadsBySource = await prisma.lead.groupBy({
      by: ['activity_source_id'],
      where: {
        company_id: companyId,
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: true,
      orderBy: {
        _count: {
          activity_source_id: 'desc',
        },
      },
      take: limit,
    });

    const sourceIds = leadsBySource.map((s) => s.activity_source_id);
    const sources = await prisma.activitySource.findMany({
      where: {
        id: { in: sourceIds },
        company_id: companyId,
      },
    });

    return leadsBySource.map((source) => ({
      source_id: source.activity_source_id,
      source_name: sources.find((s) => s.id === source.activity_source_id)?.name || 'Unknown',
      leads_count: source._count,
    }));
  }

  /**
   * Generate report
   */
  async generateReport(reportType: string, companyId: number, dateFrom?: Date, dateTo?: Date) {
    switch (reportType) {
      case 'lead_source_performance':
        return await this.getLeadSourcePerformance(companyId, dateFrom, dateTo);

      case 'conversion_funnel':
        return await this.getConversionFunnel(companyId, dateFrom, dateTo);

      case 'dashboard':
        return await this.getRealTimeDashboard(companyId);

      default:
        throw new NotFoundError('Report type');
    }
  }

  /**
   * Get ad campaigns
   */
  async getAdCampaigns(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.search) {
      where.campaign_name = { contains: filters.search };
    }

    const [campaigns, total] = await Promise.all([
      prisma.adCampaign.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
      }),
      prisma.adCampaign.count({ where }),
    ]);

    // Calculate ROI for each campaign
    const campaignsWithROI = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const roi = await this.calculateROI(campaign.id, companyId);
          return {
            ...campaign,
            roi: roi.roi,
            revenue: roi.revenue,
          };
        } catch (error) {
          return {
            ...campaign,
            roi: 0,
            revenue: 0,
          };
        }
      })
    );

    return {
      items: campaignsWithROI,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Create ad campaign
   */
  async createAdCampaign(data: any, companyId: number) {
    const campaign = await prisma.adCampaign.create({
      data: {
        company_id: companyId,
        campaign_name: data.campaign_name,
        source: data.source,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null,
        budget: data.budget ? parseFloat(data.budget) : null,
        spent: data.spent ? parseFloat(data.spent) : 0,
        leads_count: data.leads_count || 0,
        conversions: data.conversions || 0,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    return campaign;
  }

  /**
   * Update ad campaign
   */
  async updateAdCampaign(id: number, data: any, companyId: number) {
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    const updateData: any = {};

    if (data.campaign_name !== undefined) updateData.campaign_name = data.campaign_name;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.start_date !== undefined) updateData.start_date = new Date(data.start_date);
    if (data.end_date !== undefined) updateData.end_date = data.end_date ? new Date(data.end_date) : null;
    if (data.budget !== undefined) updateData.budget = data.budget ? parseFloat(data.budget) : null;
    if (data.spent !== undefined) updateData.spent = parseFloat(data.spent);
    if (data.leads_count !== undefined) updateData.leads_count = parseInt(data.leads_count);
    if (data.conversions !== undefined) updateData.conversions = parseInt(data.conversions);
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const updatedCampaign = await prisma.adCampaign.update({
      where: { id },
      data: updateData,
    });

    return updatedCampaign;
  }

  /**
   * Delete ad campaign
   */
  async deleteAdCampaign(id: number, companyId: number) {
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    await prisma.adCampaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }
}

