import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';
import emailService from './emailService';

export class AutomationService {
  /**
   * Process automation rules for a lead based on trigger type
   */
  async processAutomationRules(leadId: number, triggerType: string, companyId: number): Promise<void> {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        company_id: companyId,
      },
      include: {
        activity_source: true,
        assigned_user: true,
        status: true,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    // Get active automation rules for this trigger type
    const rules = await prisma.automationRule.findMany({
      where: {
        company_id: companyId,
        trigger_type: triggerType,
        is_active: true,
      },
      include: {
        template: true,
      },
    });

    // Process each rule
    for (const rule of rules) {
      if (this.evaluateTriggerConditions(lead, rule)) {
        await this.executeAction(lead, rule);
      }
    }
  }

  /**
   * Evaluate if trigger conditions match the lead
   */
  private evaluateTriggerConditions(lead: any, rule: any): boolean {
    try {
      const conditions = typeof rule.trigger_conditions === 'string'
        ? JSON.parse(rule.trigger_conditions)
        : rule.trigger_conditions;

      // Check activity source
      if (conditions.activity_source_id && lead.activity_source_id !== conditions.activity_source_id) {
        return false;
      }

      // Check status
      if (conditions.status_id && lead.status_id !== conditions.status_id) {
        return false;
      }

      // Check property type
      if (conditions.property_type && lead.property_type !== conditions.property_type) {
        return false;
      }

      // Check assigned user
      if (conditions.assigned_to && lead.assigned_to !== conditions.assigned_to) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error evaluating trigger conditions:', error);
      return false;
    }
  }

  /**
   * Execute automation action
   */
  private async executeAction(lead: any, rule: any): Promise<void> {
    const delay = this.calculateDelay(rule.schedule_delay, rule.schedule_unit);

    switch (rule.action_type) {
      case 'email':
        if (rule.template_id && rule.template) {
          await this.sendEmail(lead, rule.template, delay);
        }
        break;

      case 'sms':
        await this.sendSMS(lead, rule.template, delay);
        break;

      case 'whatsapp':
        await this.sendWhatsApp(lead, rule.template, delay);
        break;

      case 'schedule_visit':
        await this.scheduleVisit(lead, rule, delay);
        break;

      case 'create_followup':
        await this.createFollowUp(lead, rule, delay);
        break;

      default:
        console.warn(`Unknown action type: ${rule.action_type}`);
    }
  }

  /**
   * Calculate delay in milliseconds
   */
  private calculateDelay(delay: number | null, unit: string | null): number {
    if (!delay) return 0;

    const unitMap: { [key: string]: number } = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    return delay * (unitMap[unit || 'minutes'] || unitMap.minutes);
  }

  /**
   * Send email using template
   */
  private async sendEmail(lead: any, template: any, delay: number): Promise<void> {
    const body = this.replaceVariables(template.body, lead);
    const subject = template.subject ? this.replaceVariables(template.subject, lead) : undefined;

    if (delay > 0) {
      setTimeout(async () => {
        await emailService.sendLeadEmail(lead.email, subject || 'New Lead', body);
      }, delay);
    } else {
      await emailService.sendLeadEmail(lead.email, subject || 'New Lead', body);
    }
  }

  /**
   * Send SMS (placeholder - integrate with SMS provider)
   */
  private async sendSMS(lead: any, template: any, _delay: number): Promise<void> {
    const message = this.replaceVariables(template?.body || 'Thank you for your inquiry!', lead);
    
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    console.log(`SMS to ${lead.mobile_no}: ${message}`);
    
    // Store SMS log for future implementation
    // await prisma.smsLog.create({ ... });
  }

  /**
   * Send WhatsApp (placeholder - integrate with WhatsApp Business API)
   */
  private async sendWhatsApp(lead: any, template: any, _delay: number): Promise<void> {
    const message = this.replaceVariables(template?.body || 'Thank you for your inquiry!', lead);
    const phone = lead.whatsapp_no || lead.mobile_no;
    
    // TODO: Integrate with WhatsApp Business API
    console.log(`WhatsApp to ${phone}: ${message}`);
    
    // Store WhatsApp log for future implementation
    // await prisma.whatsappLog.create({ ... });
  }

  /**
   * Schedule property visit
   */
  private async scheduleVisit(lead: any, _rule: any, _delay: number): Promise<void> {
    // TODO: Implement visit scheduling
    // This would create a PropertyViewing record
    console.log(`Scheduling visit for lead ${lead.id}`);
  }

  /**
   * Create follow-up
   */
  private async createFollowUp(lead: any, _rule: any, delay: number): Promise<void> {
    const followUpDate = new Date();
    followUpDate.setTime(followUpDate.getTime() + delay);

    // Get default follow-up type
    const followUpType = await prisma.followupType.findFirst({
      where: {
        company_id: lead.company_id,
      },
    });

    if (followUpType) {
      await prisma.leadFollowup.create({
        data: {
          lead_id: lead.id,
          status_id: lead.status_id || null,
          type_id: followUpType.id,
          date: followUpDate,
          remarks: 'Automated follow-up created',
          next_followup_date: null,
          company_id: lead.company_id,
          created_by: lead.assigned_to || lead.created_by,
        },
      });
    }
  }

  /**
   * Replace template variables with lead data
   */
  private replaceVariables(text: string, lead: any): string {
    return text
      .replace(/\{\{name\}\}/g, lead.name || '')
      .replace(/\{\{email\}\}/g, lead.email || '')
      .replace(/\{\{mobile_no\}\}/g, lead.mobile_no || '')
      .replace(/\{\{property_type\}\}/g, lead.property_type || '')
      .replace(/\{\{interest_type\}\}/g, lead.interest_type || '')
      .replace(/\{\{min_price\}\}/g, lead.min_price?.toString() || '')
      .replace(/\{\{max_price\}\}/g, lead.max_price?.toString() || '');
  }

  /**
   * Get automation rules
   */
  async getAutomationRules(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.trigger_type) {
      where.trigger_type = filters.trigger_type;
    }

    if (filters.action_type) {
      where.action_type = filters.action_type;
    }

    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [rules, total] = await Promise.all([
      prisma.automationRule.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.automationRule.count({ where }),
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
   * Get automation rule by ID
   */
  async getAutomationRuleById(id: number, companyId: number) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        template: true,
      },
    });

    if (!rule) {
      throw new NotFoundError('Automation Rule');
    }

    return rule;
  }

  /**
   * Create automation rule
   */
  async createAutomationRule(data: any, companyId: number) {
    // Validate template if provided
    if (data.template_id) {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: data.template_id,
          company_id: companyId,
        },
      });

      if (!template) {
        throw new NotFoundError('Message Template');
      }
    }

    // Validate trigger conditions JSON
    let triggerConditions;
    try {
      triggerConditions = typeof data.trigger_conditions === 'string'
        ? JSON.parse(data.trigger_conditions)
        : data.trigger_conditions;
    } catch (error) {
      throw new ValidationError('Invalid trigger_conditions JSON');
    }

    const rule = await prisma.automationRule.create({
      data: {
        company_id: companyId,
        name: data.name,
        trigger_type: data.trigger_type,
        trigger_conditions: JSON.stringify(triggerConditions),
        action_type: data.action_type,
        template_id: data.template_id || null,
        schedule_delay: data.schedule_delay || null,
        schedule_unit: data.schedule_unit || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: {
        template: true,
      },
    });

    return rule;
  }

  /**
   * Update automation rule
   */
  async updateAutomationRule(id: number, data: any, companyId: number) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!rule) {
      throw new NotFoundError('Automation Rule');
    }

    // Validate template if provided
    if (data.template_id !== undefined) {
      if (data.template_id) {
        const template = await prisma.messageTemplate.findFirst({
          where: {
            id: data.template_id,
            company_id: companyId,
          },
        });

        if (!template) {
          throw new NotFoundError('Message Template');
        }
      }
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.trigger_type !== undefined) updateData.trigger_type = data.trigger_type;
    if (data.action_type !== undefined) updateData.action_type = data.action_type;
    if (data.template_id !== undefined) updateData.template_id = data.template_id;
    if (data.schedule_delay !== undefined) updateData.schedule_delay = data.schedule_delay;
    if (data.schedule_unit !== undefined) updateData.schedule_unit = data.schedule_unit;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (data.trigger_conditions !== undefined) {
      let triggerConditions;
      try {
        triggerConditions = typeof data.trigger_conditions === 'string'
          ? JSON.parse(data.trigger_conditions)
          : data.trigger_conditions;
        updateData.trigger_conditions = JSON.stringify(triggerConditions);
      } catch (error) {
        throw new ValidationError('Invalid trigger_conditions JSON');
      }
    }

    const updatedRule = await prisma.automationRule.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
      },
    });

    return updatedRule;
  }

  /**
   * Delete automation rule
   */
  async deleteAutomationRule(id: number, companyId: number) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!rule) {
      throw new NotFoundError('Automation Rule');
    }

    await prisma.automationRule.delete({
      where: { id },
    });

    return { message: 'Automation rule deleted successfully' };
  }

  /**
   * Get message templates
   */
  async getMessageTemplates(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { subject: { contains: filters.search } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
      }),
      prisma.messageTemplate.count({ where }),
    ]);

    return {
      items: templates,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get message template by ID
   */
  async getMessageTemplateById(id: number, companyId: number) {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Message Template');
    }

    return template;
  }

  /**
   * Create message template
   */
  async createMessageTemplate(data: any, companyId: number) {
    // Validate variables JSON
    let variables;
    try {
      variables = typeof data.variables === 'string'
        ? JSON.parse(data.variables)
        : data.variables || [];
      
      if (!Array.isArray(variables)) {
        throw new ValidationError('Variables must be an array');
      }
    } catch (error) {
      throw new ValidationError('Invalid variables JSON');
    }

    const template = await prisma.messageTemplate.create({
      data: {
        company_id: companyId,
        type: data.type,
        name: data.name,
        subject: data.subject || null,
        body: data.body,
        variables: JSON.stringify(variables),
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    return template;
  }

  /**
   * Update message template
   */
  async updateMessageTemplate(id: number, data: any, companyId: number) {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Message Template');
    }

    const updateData: any = {};

    if (data.type !== undefined) updateData.type = data.type;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (data.variables !== undefined) {
      let variables;
      try {
        variables = typeof data.variables === 'string'
          ? JSON.parse(data.variables)
          : data.variables;
        
        if (!Array.isArray(variables)) {
          throw new ValidationError('Variables must be an array');
        }
        updateData.variables = JSON.stringify(variables);
      } catch (error) {
        throw new ValidationError('Invalid variables JSON');
      }
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id },
      data: updateData,
    });

    return updatedTemplate;
  }

  /**
   * Delete message template
   */
  async deleteMessageTemplate(id: number, companyId: number) {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Message Template');
    }

    await prisma.messageTemplate.delete({
      where: { id },
    });

    return { message: 'Message template deleted successfully' };
  }
}

