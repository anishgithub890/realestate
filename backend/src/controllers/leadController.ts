import { Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import { LeadService } from '../services/leadService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { parseCsvText, buildHeaderMap, getValueFromRow, validateRequiredFields } from '../utils/csvParser';
import prisma from '../config/database';

const leadService = new LeadService();

const DETAIL_LIMIT = 50;

// CSV column definitions for leads
const LEAD_CSV_COLUMNS = [
  { keys: ['name', 'full name', 'fullname'], name: 'name', required: true },
  { keys: ['email', 'email address'], name: 'email', required: true },
  { keys: ['mobile', 'mobile_no', 'mobile number', 'phone', 'phone number'], name: 'mobile_no', required: true },
  { keys: ['whatsapp', 'whatsapp_no', 'whatsapp number'], name: 'whatsapp_no', required: false },
  { keys: ['property_type', 'property type', 'type'], name: 'property_type', required: true },
  { keys: ['interest_type', 'interest type', 'interest'], name: 'interest_type', required: true },
  { keys: ['min_price', 'min price', 'minimum price'], name: 'min_price', required: true },
  { keys: ['max_price', 'max price', 'maximum price'], name: 'max_price', required: true },
  { keys: ['description', 'notes', 'remarks'], name: 'description', required: false },
  { keys: ['address'], name: 'address', required: false },
  { keys: ['activity_source', 'activity_source_id', 'source', 'lead source'], name: 'activity_source', required: false },
  { keys: ['status', 'status_id', 'lead status'], name: 'status', required: false },
  { keys: ['assigned_to', 'assigned_user', 'assigned user', 'user'], name: 'assigned_to', required: false },
  { keys: ['utm_source', 'utm source'], name: 'utm_source', required: false },
  { keys: ['utm_medium', 'utm medium'], name: 'utm_medium', required: false },
  { keys: ['utm_campaign', 'utm campaign'], name: 'utm_campaign', required: false },
];

export class LeadController {
  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await leadService.getLeads(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const lead = await leadService.getLeadById(id, req.user.companyId);
      return sendSuccess(res, lead);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const lead = await leadService.createLead(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const lead = await leadService.updateLead(id, req.body, req.user.companyId);
      return sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const result = await leadService.deleteLead(id, req.user.companyId);
      return sendSuccess(res, result, 'Lead deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async bulkUploadLeadsFromCsv(req: Request, res: Response, next: NextFunction) {
    const uploadedFilePath = req.file?.path;

    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      if (!req.file?.path) {
        res.status(400).json({ success: false, error: 'CSV file is required' });
        return;
      }

      const fileContent = await fs.readFile(req.file.path, 'utf8');
      const rows = parseCsvText(fileContent);

      if (rows.length < 2) {
        res.status(400).json({
          success: false,
          error: 'CSV must contain at least a header row and one data row',
        });
        return;
      }

      const headerRow = rows[0];
      const dataRows = rows.slice(1);
      const headerMap = buildHeaderMap(headerRow);

      // Validate required columns
      const requiredFields = LEAD_CSV_COLUMNS.filter((col) => col.required).map((col) => ({
        keys: col.keys,
        name: col.name,
      }));

      const hasRequiredColumns = requiredFields.every((field) =>
        field.keys.some((key) => headerMap.has(key))
      );

      if (!hasRequiredColumns) {
        res.status(400).json({
          success: false,
          error: 'CSV is missing required columns. Required: name, email, mobile_no, property_type, interest_type, min_price, max_price',
        });
        return;
      }

      const counts = {
        created: 0,
        skipped: 0,
        failed: 0,
      };

      const details = {
        created: [] as Array<{ id: number; name: string; email: string }>,
        skipped: [] as Array<{ email: string; reason: string }>,
        failed: [] as Array<{ email: string; reason: string; row?: number }>,
      };

      const truncated = {
        created: false,
        skipped: false,
        failed: false,
      };

      type DetailKey = keyof typeof details;
      const pushDetail = (key: DetailKey, entry: (typeof details)[DetailKey][number]): void => {
        if (details[key].length < DETAIL_LIMIT) {
          (details[key] as any[]).push(entry);
        } else {
          truncated[key] = true;
        }
      };

      // Get activity sources and users for lookup
      const activitySources = await prisma.activitySource.findMany({
        where: { company_id: req.user.companyId },
        select: { id: true, name: true },
      });

      const users = await prisma.user.findMany({
        where: { company_id: req.user.companyId },
        select: { id: true, name: true, email: true },
      });

      const activitySourceMap = new Map(
        activitySources.map((as: { id: number; name: string }) => [as.name.toLowerCase(), as.id])
      );
      const userMap = new Map(users.map((u: { id: number; email: string }) => [u.email.toLowerCase(), u.id]));

      // Get default activity source
      const defaultActivitySource = activitySources[0];
      if (!defaultActivitySource) {
        res.status(400).json({
          success: false,
          error: 'No activity source found. Please create an activity source first.',
        });
        return;
      }

      // Process each row
      for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
        const row = dataRows[rowIdx];
        if (!row || row.every((cell) => !cell)) {
          continue;
        }

        try {
          // Validate required fields
          const validation = validateRequiredFields(row, headerMap, requiredFields);
          if (!validation.valid) {
            counts.failed += 1;
            pushDetail('failed', {
              email: getValueFromRow(row, headerMap, ['email', 'email address']) || 'N/A',
              reason: `Missing required fields: ${validation.missing.join(', ')}`,
              row: rowIdx + 2,
            });
            continue;
          }

          // Extract values
          const name = getValueFromRow(row, headerMap, ['name', 'full name', 'fullname']);
          const email = getValueFromRow(row, headerMap, ['email', 'email address']);
          const mobileNo = getValueFromRow(row, headerMap, ['mobile', 'mobile_no', 'mobile number', 'phone']);
          const whatsappNo = getValueFromRow(row, headerMap, ['whatsapp', 'whatsapp_no', 'whatsapp number']);
          const propertyType = getValueFromRow(row, headerMap, ['property_type', 'property type', 'type']);
          const interestType = getValueFromRow(row, headerMap, ['interest_type', 'interest type', 'interest']);
          const minPrice = getValueFromRow(row, headerMap, ['min_price', 'min price', 'minimum price']);
          const maxPrice = getValueFromRow(row, headerMap, ['max_price', 'max price', 'maximum price']);
          const description = getValueFromRow(row, headerMap, ['description', 'notes', 'remarks']);
          const address = getValueFromRow(row, headerMap, ['address']);
          const activitySourceName = getValueFromRow(row, headerMap, ['activity_source', 'activity_source_id', 'source', 'lead source']);
          const assignedToEmail = getValueFromRow(row, headerMap, ['assigned_to', 'assigned_user', 'assigned user', 'user']);
          const utmSource = getValueFromRow(row, headerMap, ['utm_source', 'utm source']);
          const utmMedium = getValueFromRow(row, headerMap, ['utm_medium', 'utm medium']);
          const utmCampaign = getValueFromRow(row, headerMap, ['utm_campaign', 'utm campaign']);

          // Check if lead already exists (by email)
          const existingLead = await prisma.lead.findFirst({
            where: {
              email: email!,
              company_id: req.user.companyId,
            },
          });

          if (existingLead) {
            counts.skipped += 1;
            pushDetail('skipped', {
              email: email!,
              reason: 'Lead with this email already exists',
            });
            continue;
          }

          // Resolve activity source
          let activitySourceId = defaultActivitySource.id;
          if (activitySourceName) {
            const foundId = activitySourceMap.get(activitySourceName.toLowerCase());
            if (foundId) {
              activitySourceId = foundId;
            }
          }

          // Resolve assigned user
          let assignedTo: number | null = null;
          if (assignedToEmail) {
            const foundId = userMap.get(assignedToEmail.toLowerCase());
            if (foundId) {
              assignedTo = foundId;
            }
          }

          // Create lead data
          const leadData: any = {
            name: name!,
            email: email!,
            mobile_no: mobileNo!,
            whatsapp_no: whatsappNo || null,
            property_type: propertyType!,
            interest_type: interestType!,
            min_price: parseFloat(minPrice!),
            max_price: parseFloat(maxPrice!),
            description: description || null,
            address: address || null,
            activity_source_id: activitySourceId,
            assigned_to: assignedTo,
            utm_source: utmSource || null,
            utm_medium: utmMedium || null,
            utm_campaign: utmCampaign || null,
          };

          // Create lead
          const lead = await leadService.createLead(leadData, req.user.companyId, req.user.userId);

          counts.created += 1;
          pushDetail('created', {
            id: lead.id,
            name: lead.name,
            email: lead.email,
          });
        } catch (error: any) {
          counts.failed += 1;
          const email = getValueFromRow(row, headerMap, ['email', 'email address']) || 'N/A';
          pushDetail('failed', {
            email,
            reason: error.message || 'Unknown error',
            row: rowIdx + 2,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `CSV processed successfully. Created ${counts.created}, skipped ${counts.skipped}, failed ${counts.failed}.`,
        data: {
          counts,
          details,
          meta: {
            totalRows: dataRows.length,
            detailLimit: DETAIL_LIMIT,
            truncated,
          },
        },
      });
    } catch (error: any) {
      next(error);
    } finally {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => undefined);
      }
    }
  }

  async assignLead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const leadId = parseInt(req.params.id);
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'user_id is required',
        });
      }

      const lead = await leadService.assignLead(
        leadId,
        user_id,
        req.user.companyId
      );
      return sendSuccess(res, lead, 'Lead assigned successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getLeadStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const stats = await leadService.getLeadStats(req.user.companyId, req.query);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return next(error);
    }
  }
}

