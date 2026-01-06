import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class RoutingService {
  /**
   * Automatically route a lead based on routing rules
   */
  async autoRouteLead(leadId: number, companyId: number): Promise<any> {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        company_id: companyId,
      },
      include: {
        activity_source: true,
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
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    // Get active routing rules ordered by priority
    const rules = await prisma.leadRoutingRule.findMany({
      where: {
        company_id: companyId,
        is_active: true,
      },
      orderBy: {
        priority: 'desc',
      },
      include: {
        assigned_user: true,
        assigned_role: true,
      },
    });

    // Evaluate rules in priority order
    for (const rule of rules) {
      if (this.evaluateRoutingRule(lead, rule)) {
        const assignedUserId = await this.getAssignedUserId(rule, companyId);
        
        if (assignedUserId) {
          return await this.assignToAgent(leadId, assignedUserId, companyId);
        }
      }
    }

    // No rule matched, return lead without assignment
    return lead;
  }

  /**
   * Evaluate if a routing rule matches a lead
   */
  private evaluateRoutingRule(lead: any, rule: any): boolean {
    try {
      const conditions = typeof rule.conditions === 'string' 
        ? JSON.parse(rule.conditions) 
        : rule.conditions;

      // Check activity source
      if (conditions.activity_source_id && lead.activity_source_id !== conditions.activity_source_id) {
        return false;
      }

      // Check property type
      if (conditions.property_type && lead.property_type !== conditions.property_type) {
        return false;
      }

      // Check interest type
      if (conditions.interest_type && lead.interest_type !== conditions.interest_type) {
        return false;
      }

      // Check budget range
      if (conditions.min_price && lead.min_price < conditions.min_price) {
        return false;
      }
      if (conditions.max_price && lead.max_price > conditions.max_price) {
        return false;
      }

      // Check preferred areas
      if (conditions.area_ids && conditions.area_ids.length > 0) {
        const leadAreaIds = lead.preferred_areas?.map((pa: any) => pa.area_id) || [];
        const hasMatchingArea = conditions.area_ids.some((areaId: number) => 
          leadAreaIds.includes(areaId)
        );
        if (!hasMatchingArea) {
          return false;
        }
      }

      // Check city/state
      if (conditions.city || conditions.state_id) {
        const leadCities = lead.preferred_areas?.map((pa: any) => 
          pa.area?.state?.name
        ).filter(Boolean) || [];
        
        if (conditions.city && !leadCities.includes(conditions.city)) {
          return false;
        }
        
        if (conditions.state_id) {
          const leadStateIds = lead.preferred_areas?.map((pa: any) => 
            pa.area?.state_id
          ).filter(Boolean) || [];
          if (!leadStateIds.includes(conditions.state_id)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating routing rule:', error);
      return false;
    }
  }

  /**
   * Get the user ID to assign based on assignment type
   */
  private async getAssignedUserId(rule: any, companyId: number): Promise<number | null> {
    switch (rule.assignment_type) {
      case 'specific_user':
        return rule.assigned_user_id;

      case 'round_robin':
        return await this.getRoundRobinUser(companyId, rule.assigned_role_id);

      case 'load_balance':
        return await this.getLoadBalancedUser(companyId, rule.assigned_role_id);

      case 'role_based':
        return await this.getRoleBasedUser(companyId, rule.assigned_role_id);

      default:
        return null;
    }
  }

  /**
   * Get user using round-robin assignment
   */
  private async getRoundRobinUser(companyId: number, roleId: number | null): Promise<number | null> {
    const where: any = {
      company_id: companyId,
      is_active: 'true',
    };

    if (roleId) {
      where.role_id = roleId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        id: 'asc',
      },
    });

    if (users.length === 0) {
      return null;
    }

    // Get the last assigned user for this company (stored in cache or DB)
    // For simplicity, we'll use a simple round-robin based on lead count
    const userLeadCounts = await Promise.all(
      users.map(async (user) => {
        const count = await prisma.lead.count({
          where: {
            company_id: companyId,
            assigned_to: user.id,
          },
        });
        return { userId: user.id, count };
      })
    );

    // Return user with least leads
    const sorted = userLeadCounts.sort((a, b) => a.count - b.count);
    return sorted[0]?.userId || null;
  }

  /**
   * Get user using load balancing (based on current workload)
   */
  private async getLoadBalancedUser(companyId: number, roleId: number | null): Promise<number | null> {
    const where: any = {
      company_id: companyId,
      is_active: 'true',
    };

    if (roleId) {
      where.role_id = roleId;
    }

    const users = await prisma.user.findMany({
      where,
    });

    if (users.length === 0) {
      return null;
    }

    // Calculate workload (unassigned leads + active follow-ups)
    const userWorkloads = await Promise.all(
      users.map(async (user) => {
        const [unassignedLeads, activeFollowups] = await Promise.all([
          prisma.lead.count({
            where: {
              company_id: companyId,
              assigned_to: user.id,
              status_id: null,
            },
          }),
          prisma.leadFollowup.count({
            where: {
              company_id: companyId,
              lead: {
                assigned_to: user.id,
              },
              next_followup_date: {
                gte: new Date(),
              },
            },
          }),
        ]);

        return {
          userId: user.id,
          workload: unassignedLeads + activeFollowups,
        };
      })
    );

    // Return user with least workload
    const sorted = userWorkloads.sort((a, b) => a.workload - b.workload);
    return sorted[0]?.userId || null;
  }

  /**
   * Get user based on role (first available user with the role)
   */
  private async getRoleBasedUser(companyId: number, roleId: number | null): Promise<number | null> {
    if (!roleId) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        company_id: companyId,
        role_id: roleId,
        is_active: 'true',
      },
    });

    return user?.id || null;
  }

  /**
   * Assign lead to an agent
   */
  async assignToAgent(leadId: number, userId: number, companyId: number): Promise<any> {
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

  /**
   * Get routing rules
   */
  async getRoutingRules(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.search) {
      where.rule_name = { contains: filters.search };
    }

    const [rules, total] = await Promise.all([
      prisma.leadRoutingRule.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'priority', sortOrder || 'desc'),
        include: {
          assigned_user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assigned_role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.leadRoutingRule.count({ where }),
    ]);

    return {
      items: rules,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get routing rule by ID
   */
  async getRoutingRuleById(id: number, companyId: number) {
    const rule = await prisma.leadRoutingRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        assigned_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assigned_role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundError('Routing Rule');
    }

    return rule;
  }

  /**
   * Create routing rule
   */
  async createRoutingRule(data: any, companyId: number) {
    // Validate assigned user if provided
    if (data.assigned_user_id) {
      const user = await prisma.user.findFirst({
        where: {
          id: data.assigned_user_id,
          company_id: companyId,
        },
      });

      if (!user) {
        throw new NotFoundError('Assigned User');
      }
    }

    // Validate assigned role if provided
    if (data.assigned_role_id) {
      const role = await prisma.role.findFirst({
        where: {
          id: data.assigned_role_id,
          company_id: companyId,
        },
      });

      if (!role) {
        throw new NotFoundError('Assigned Role');
      }
    }

    // Validate conditions JSON
    let conditions;
    try {
      conditions = typeof data.conditions === 'string' 
        ? JSON.parse(data.conditions) 
        : data.conditions;
    } catch (error) {
      throw new ValidationError('Invalid conditions JSON');
    }

    const rule = await prisma.leadRoutingRule.create({
      data: {
        company_id: companyId,
        rule_name: data.rule_name,
        priority: data.priority || 0,
        is_active: data.is_active !== undefined ? data.is_active : true,
        conditions: JSON.stringify(conditions),
        assignment_type: data.assignment_type,
        assigned_user_id: data.assigned_user_id || null,
        assigned_role_id: data.assigned_role_id || null,
      },
      include: {
        assigned_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assigned_role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return rule;
  }

  /**
   * Update routing rule
   */
  async updateRoutingRule(id: number, data: any, companyId: number) {
    const rule = await prisma.leadRoutingRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!rule) {
      throw new NotFoundError('Routing Rule');
    }

    // Validate assigned user if provided
    if (data.assigned_user_id !== undefined) {
      if (data.assigned_user_id) {
        const user = await prisma.user.findFirst({
          where: {
            id: data.assigned_user_id,
            company_id: companyId,
          },
        });

        if (!user) {
          throw new NotFoundError('Assigned User');
        }
      }
    }

    // Validate assigned role if provided
    if (data.assigned_role_id !== undefined) {
      if (data.assigned_role_id) {
        const role = await prisma.role.findFirst({
          where: {
            id: data.assigned_role_id,
            company_id: companyId,
          },
        });

        if (!role) {
          throw new NotFoundError('Assigned Role');
        }
      }
    }

    const updateData: any = {};

    if (data.rule_name !== undefined) updateData.rule_name = data.rule_name;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.assignment_type !== undefined) updateData.assignment_type = data.assignment_type;
    if (data.assigned_user_id !== undefined) updateData.assigned_user_id = data.assigned_user_id;
    if (data.assigned_role_id !== undefined) updateData.assigned_role_id = data.assigned_role_id;

    if (data.conditions !== undefined) {
      let conditions;
      try {
        conditions = typeof data.conditions === 'string' 
          ? JSON.parse(data.conditions) 
          : data.conditions;
        updateData.conditions = JSON.stringify(conditions);
      } catch (error) {
        throw new ValidationError('Invalid conditions JSON');
      }
    }

    const updatedRule = await prisma.leadRoutingRule.update({
      where: { id },
      data: updateData,
      include: {
        assigned_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assigned_role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedRule;
  }

  /**
   * Delete routing rule
   */
  async deleteRoutingRule(id: number, companyId: number) {
    const rule = await prisma.leadRoutingRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!rule) {
      throw new NotFoundError('Routing Rule');
    }

    await prisma.leadRoutingRule.delete({
      where: { id },
    });

    return { message: 'Routing rule deleted successfully' };
  }

  /**
   * Get pipelines
   */
  async getPipelines(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.is_default !== undefined) {
      where.is_default = filters.is_default === 'true' || filters.is_default === true;
    }

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [pipelines, total] = await Promise.all([
      prisma.leadPipeline.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
      }),
      prisma.leadPipeline.count({ where }),
    ]);

    return {
      items: pipelines,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get pipeline by ID
   */
  async getPipelineById(id: number, companyId: number) {
    const pipeline = await prisma.leadPipeline.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!pipeline) {
      throw new NotFoundError('Pipeline');
    }

    return pipeline;
  }

  /**
   * Create pipeline
   */
  async createPipeline(data: any, companyId: number) {
    // Validate stages JSON
    let stages;
    try {
      stages = typeof data.stages === 'string' 
        ? JSON.parse(data.stages) 
        : data.stages;
      
      if (!Array.isArray(stages)) {
        throw new ValidationError('Stages must be an array');
      }
    } catch (error) {
      throw new ValidationError('Invalid stages JSON');
    }

    // If this is set as default, unset other defaults
    if (data.is_default) {
      await prisma.leadPipeline.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const pipeline = await prisma.leadPipeline.create({
      data: {
        company_id: companyId,
        name: data.name,
        stages: JSON.stringify(stages),
        is_default: data.is_default || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    return pipeline;
  }

  /**
   * Update pipeline
   */
  async updatePipeline(id: number, data: any, companyId: number) {
    const pipeline = await prisma.leadPipeline.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!pipeline) {
      throw new NotFoundError('Pipeline');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_default !== undefined) updateData.is_default = data.is_default;

    if (data.stages !== undefined) {
      let stages;
      try {
        stages = typeof data.stages === 'string' 
          ? JSON.parse(data.stages) 
          : data.stages;
        
        if (!Array.isArray(stages)) {
          throw new ValidationError('Stages must be an array');
        }
        updateData.stages = JSON.stringify(stages);
      } catch (error) {
        throw new ValidationError('Invalid stages JSON');
      }
    }

    // If setting as default, unset other defaults
    if (data.is_default === true) {
      await prisma.leadPipeline.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
          id: { not: id },
        },
        data: {
          is_default: false,
        },
      });
    }

    const updatedPipeline = await prisma.leadPipeline.update({
      where: { id },
      data: updateData,
    });

    return updatedPipeline;
  }

  /**
   * Delete pipeline
   */
  async deletePipeline(id: number, companyId: number) {
    const pipeline = await prisma.leadPipeline.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!pipeline) {
      throw new NotFoundError('Pipeline');
    }

    await prisma.leadPipeline.delete({
      where: { id },
    });

    return { message: 'Pipeline deleted successfully' };
  }
}

