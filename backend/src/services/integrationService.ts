import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';
import crypto from 'crypto';

export class IntegrationService {
  /**
   * Create or update integration
   */
  async upsertIntegration(data: any, companyId: number) {
    const validTypes = ['google_ads', 'facebook_ads', 'zapier', 'bayut', 'property_finder', 'whatsapp_business'];
    
    if (!validTypes.includes(data.integration_type)) {
      throw new ValidationError(`Invalid integration type. Valid types: ${validTypes.join(', ')}`);
    }

    // Validate config JSON
    let config;
    if (data.config) {
      try {
        config = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;
      } catch (error) {
        throw new ValidationError('Invalid config JSON');
      }
    }

    // Check if integration exists
    const existing = await prisma.integration.findFirst({
      where: {
        company_id: companyId,
        integration_type: data.integration_type,
      },
    });

    if (existing) {
      const integration = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          api_key: data.api_key !== undefined ? data.api_key : existing.api_key,
          api_secret: data.api_secret !== undefined ? data.api_secret : existing.api_secret,
          access_token: data.access_token !== undefined ? data.access_token : existing.access_token,
          refresh_token: data.refresh_token !== undefined ? data.refresh_token : existing.refresh_token,
          config: config ? (config as any) : existing.config,
          is_active: data.is_active !== undefined ? data.is_active : existing.is_active,
          last_sync_at: data.last_sync_at ? new Date(data.last_sync_at) : existing.last_sync_at,
        },
      });

      return integration;
    } else {
      const integration = await prisma.integration.create({
        data: {
          company_id: companyId,
          integration_type: data.integration_type,
          api_key: data.api_key || null,
          api_secret: data.api_secret || null,
          access_token: data.access_token || null,
          refresh_token: data.refresh_token || null,
          config: config ? (config as any) : null,
          is_active: data.is_active !== undefined ? data.is_active : true,
          last_sync_at: data.last_sync_at ? new Date(data.last_sync_at) : null,
        },
      });

      return integration;
    }
  }

  /**
   * Get integrations
   */
  async getIntegrations(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.integration_type) {
      where.integration_type = filters.integration_type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    const [integrations, total] = await Promise.all([
      prisma.integration.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
      }),
      prisma.integration.count({ where }),
    ]);

    // Remove sensitive data from response
    const safeIntegrations = integrations.map((integration) => ({
      ...integration,
      api_key: integration.api_key ? '***' : null,
      api_secret: integration.api_secret ? '***' : null,
      access_token: integration.access_token ? '***' : null,
      refresh_token: integration.refresh_token ? '***' : null,
    }));

    return {
      items: safeIntegrations,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get integration by ID
   */
  async getIntegrationById(id: number, companyId: number) {
    const integration = await prisma.integration.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!integration) {
      throw new NotFoundError('Integration');
    }

    // Remove sensitive data
    return {
      ...integration,
      api_key: integration.api_key ? '***' : null,
      api_secret: integration.api_secret ? '***' : null,
      access_token: integration.access_token ? '***' : null,
      refresh_token: integration.refresh_token ? '***' : null,
    };
  }

  /**
   * Delete integration
   */
  async deleteIntegration(id: number, companyId: number) {
    const integration = await prisma.integration.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!integration) {
      throw new NotFoundError('Integration');
    }

    await prisma.integration.delete({
      where: { id },
    });

    return { message: 'Integration deleted successfully' };
  }

  /**
   * Sync leads from Google Ads
   */
  async syncGoogleAdsLeads(companyId: number) {
    const integration = await prisma.integration.findFirst({
      where: {
        company_id: companyId,
        integration_type: 'google_ads',
        is_active: true,
      },
    });

    if (!integration) {
      throw new NotFoundError('Google Ads integration not found or inactive');
    }

    // TODO: Implement Google Ads API integration
    // This would fetch leads from Google Ads API and create Lead records
    console.log('Syncing Google Ads leads...');
    
    // Update last sync time
    await prisma.integration.update({
      where: { id: integration.id },
      data: { last_sync_at: new Date() },
    });

    return { message: 'Google Ads leads sync initiated', synced_at: new Date() };
  }

  /**
   * Sync leads from Facebook Ads
   */
  async syncFacebookAdsLeads(companyId: number) {
    const integration = await prisma.integration.findFirst({
      where: {
        company_id: companyId,
        integration_type: 'facebook_ads',
        is_active: true,
      },
    });

    if (!integration) {
      throw new NotFoundError('Facebook Ads integration not found or inactive');
    }

    // TODO: Implement Facebook Marketing API integration
    console.log('Syncing Facebook Ads leads...');
    
    await prisma.integration.update({
      where: { id: integration.id },
      data: { last_sync_at: new Date() },
    });

    return { message: 'Facebook Ads leads sync initiated', synced_at: new Date() };
  }

  /**
   * Sync leads from property portal
   */
  async syncPortalLeads(portalName: string, companyId: number) {
    const integration = await prisma.integration.findFirst({
      where: {
        company_id: companyId,
        integration_type: portalName.toLowerCase(),
        is_active: true,
      },
    });

    if (!integration) {
      throw new NotFoundError(`${portalName} integration not found or inactive`);
    }

    // TODO: Implement portal API integration
    console.log(`Syncing ${portalName} leads...`);
    
    await prisma.integration.update({
      where: { id: integration.id },
      data: { last_sync_at: new Date() },
    });

    return { message: `${portalName} leads sync initiated`, synced_at: new Date() };
  }

  /**
   * Handle webhook from external service
   */
  async handleWebhook(webhookId: number, payload: any, signature?: string) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
      include: {
        integration: true,
      },
    });

    if (!webhook || !webhook.is_active) {
      throw new NotFoundError('Webhook not found or inactive');
    }

    // Verify webhook signature if secret is set
    if (webhook.secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new ValidationError('Invalid webhook signature');
      }
    }

    // Update last triggered time
    await prisma.webhook.update({
      where: { id: webhookId },
      data: { last_triggered_at: new Date() },
    });

    // Process webhook based on event type
    switch (webhook.event_type) {
      case 'lead.created':
        return await this.processLeadWebhook(webhook.company_id, payload);
      
      case 'lead.updated':
        return await this.processLeadUpdateWebhook(webhook.company_id, payload);
      
      default:
        return { message: 'Webhook received', event_type: webhook.event_type };
    }
  }

  /**
   * Process lead creation webhook
   */
  private async processLeadWebhook(companyId: number, payload: any) {
    // Get or create activity source
    let activitySource = await prisma.activitySource.findFirst({
      where: {
        company_id: companyId,
        name: payload.source || 'Webhook',
      },
    });

    if (!activitySource) {
      activitySource = await prisma.activitySource.create({
        data: {
          company_id: companyId,
          name: payload.source || 'Webhook',
        },
      });
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: payload.name,
        email: payload.email,
        mobile_no: payload.mobile_no || payload.phone,
        whatsapp_no: payload.whatsapp_no || null,
        property_type: payload.property_type || 'apartment',
        interest_type: payload.interest_type || 'rent',
        min_price: payload.min_price ? parseFloat(payload.min_price) : 0,
        max_price: payload.max_price ? parseFloat(payload.max_price) : 1000000,
        description: payload.description || null,
        address: payload.address || null,
        activity_source_id: activitySource.id,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        utm_term: payload.utm_term || null,
        utm_content: payload.utm_content || null,
        referrer_url: payload.referrer_url || null,
        landing_page: payload.landing_page || null,
        company_id: companyId,
        created_by: 1, // System user
      },
    });

    return { message: 'Lead created from webhook', lead_id: lead.id };
  }

  /**
   * Process lead update webhook
   */
  private async processLeadUpdateWebhook(companyId: number, payload: any) {
    // Find lead by external ID or email
    const lead = await prisma.lead.findFirst({
      where: {
        company_id: companyId,
        email: payload.email,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Update lead
    const updateData: any = {};
    if (payload.status) updateData.status_id = payload.status;
    if (payload.assigned_to) updateData.assigned_to = payload.assigned_to;

    await prisma.lead.update({
      where: { id: lead.id },
      data: updateData,
    });

    return { message: 'Lead updated from webhook', lead_id: lead.id };
  }

  /**
   * Get webhooks
   */
  async getWebhooks(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.event_type) {
      where.event_type = filters.event_type;
    }

    if (filters.integration_id) {
      where.integration_id = parseInt(filters.integration_id);
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          integration: {
            select: {
              id: true,
              integration_type: true,
            },
          },
        },
      }),
      prisma.webhook.count({ where }),
    ]);

    return {
      items: webhooks,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get webhook by ID
   */
  async getWebhookById(id: number, companyId: number) {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        integration: true,
      },
    });

    if (!webhook) {
      throw new NotFoundError('Webhook');
    }

    return webhook;
  }

  /**
   * Create webhook
   */
  async createWebhook(data: any, companyId: number) {
    // Validate integration if provided
    if (data.integration_id) {
      const integration = await prisma.integration.findFirst({
        where: {
          id: data.integration_id,
          company_id: companyId,
        },
      });

      if (!integration) {
        throw new NotFoundError('Integration');
      }
    }

    // Generate secret if not provided
    const secret = data.secret || crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        company_id: companyId,
        integration_id: data.integration_id || null,
        event_type: data.event_type,
        url: data.url,
        secret: secret,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: {
        integration: true,
      },
    });

    return webhook;
  }

  /**
   * Update webhook
   */
  async updateWebhook(id: number, data: any, companyId: number) {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!webhook) {
      throw new NotFoundError('Webhook');
    }

    const updateData: any = {};

    if (data.event_type !== undefined) updateData.event_type = data.event_type;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.secret !== undefined) updateData.secret = data.secret;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.integration_id !== undefined) updateData.integration_id = data.integration_id;

    const updatedWebhook = await prisma.webhook.update({
      where: { id },
      data: updateData,
      include: {
        integration: true,
      },
    });

    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: number, companyId: number) {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!webhook) {
      throw new NotFoundError('Webhook');
    }

    await prisma.webhook.delete({
      where: { id },
    });

    return { message: 'Webhook deleted successfully' };
  }

  /**
   * Public endpoint to receive webhook from external services
   */
  async receiveWebhook(webhookId: number, payload: any, headers: any) {
    const signature = headers['x-webhook-signature'] || headers['x-signature'] || headers.signature;
    
    try {
      const result = await this.handleWebhook(webhookId, payload, signature);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}

