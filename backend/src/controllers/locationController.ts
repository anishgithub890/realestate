import { Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import { LocationService } from '../services/locationService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { parseCsvText, buildHeaderMap, getValueFromRow } from '../utils/csvParser';

const locationService = new LocationService();

const DETAIL_LIMIT = 50;

// CSV column definitions for locations
const LOCATION_CSV_COLUMNS = [
  { level: 'EMIRATE', keys: ['emirate'] },
  { level: 'NEIGHBOURHOOD', keys: ['neighbourhood', 'neighborhood'] },
  { level: 'CLUSTER', keys: ['cluster'] },
  { level: 'BUILDING', keys: ['building'] },
  { level: 'BUILDING_LVL1', keys: ['building_lvl1', 'building lvl1', 'building level 1'] },
  { level: 'BUILDING_LVL2', keys: ['building_lvl2', 'building lvl2', 'building level 2'] },
];

export class LocationController {
  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await locationService.getLocations(
        req.user.companyId,
        req.query,
        req.query
      );
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const location = await locationService.getLocationById(id, req.user.companyId);
      return sendSuccess(res, location);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationTree(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parentId = req.query.parent_id as string | undefined;
      const tree = await locationService.getLocationTree(req.user.companyId, parentId);
      return sendSuccess(res, tree);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const location = await locationService.createLocation(req.body, req.user.companyId);
      return sendSuccess(res, location, 'Location created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const location = await locationService.updateLocation(id, req.body, req.user.companyId);
      return sendSuccess(res, location, 'Location updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      await locationService.deleteLocation(id, req.user.companyId);
      return sendSuccess(res, null, 'Location deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationsByLevel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const level = req.params.level;
      const locations = await locationService.getLocationsByLevel(req.user.companyId, level);
      return sendSuccess(res, locations);
    } catch (error: any) {
      return next(error);
    }
  }

  async getLocationPath(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id;
      const path = await locationService.getLocationPath(id, req.user.companyId);
      return sendSuccess(res, path);
    } catch (error: any) {
      return next(error);
    }
  }

  async bulkUploadLocationsFromCsv(req: Request, res: Response, next: NextFunction) {
    const uploadedFilePath = req.file?.path;

    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!req.file?.path) {
        return res.status(400).json({ success: false, error: 'CSV file is required' });
      }

      const fileContent = await fs.readFile(req.file.path, 'utf8');
      const rows = parseCsvText(fileContent);

      if (rows.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'CSV must contain at least a header row and one data row',
        });
      }

      const headerRow = rows[0];
      const dataRows = rows.slice(1);
      const headerMap = buildHeaderMap(headerRow);

      // Check if CSV has recognized columns
      const hasRecognizedColumns = LOCATION_CSV_COLUMNS.some((def) =>
        def.keys.some((key) => headerMap.has(key))
      );

      if (!hasRecognizedColumns) {
        return res.status(400).json({
          success: false,
          error: 'CSV does not contain recognizable location columns. Expected: emirate, neighbourhood, cluster, building, building_lvl1, building_lvl2',
        });
      }

      // Build location nodes from CSV
      const nodes = new Map<string, {
        name: string;
        level: string;
        fullPath: string;
        parentFullPath: string | null;
        row: number;
      }>();

      dataRows.forEach((row, rowIdx) => {
        if (row.every((cell) => !cell)) {
          return;
        }

        const pathSegments: string[] = [];

        LOCATION_CSV_COLUMNS.forEach((def) => {
          const value = getValueFromRow(row, headerMap, def.keys);
          if (!value) {
            return;
          }

          pathSegments.push(value);
          const fullPath = pathSegments.join(' / ');

          if (!nodes.has(fullPath)) {
            nodes.set(fullPath, {
              name: value,
              level: def.level,
              fullPath,
              parentFullPath: pathSegments.length > 1 ? pathSegments.slice(0, -1).join(' / ') : null,
              row: rowIdx + 2,
            });
          }
        });
      });

      const locationNodes = Array.from(nodes.values());

      if (locationNodes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid location data found in CSV',
        });
      }

      // Get existing locations
      const prisma = require('../config/database').default;
      const existingLocations = await prisma.location.findMany({
        where: { company_id: req.user.companyId },
        select: { id: true, full_path: true },
      });

      const fullPathMap = new Map<string, string>();
      existingLocations.forEach((loc: any) => {
        fullPathMap.set(loc.full_path, loc.id);
      });

      const counts = {
        created: 0,
        skipped: 0,
        failed: 0,
      };

      const details = {
        created: [] as Array<{ id: string; fullPath: string; level: string }>,
        skipped: [] as Array<{ fullPath: string; reason: string }>,
        failed: [] as Array<{ fullPath: string; reason: string; row?: number }>,
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

      // Process locations by level order
      const levelOrder = ['EMIRATE', 'NEIGHBOURHOOD', 'CLUSTER', 'BUILDING', 'BUILDING_LVL1', 'BUILDING_LVL2'];

      for (const level of levelOrder) {
        const levelNodes = locationNodes.filter((node) => node.level === level);

        for (const node of levelNodes) {
          if (fullPathMap.has(node.fullPath)) {
            counts.skipped += 1;
            pushDetail('skipped', {
              fullPath: node.fullPath,
              reason: 'Location already exists',
            });
            continue;
          }

          if (node.parentFullPath && !fullPathMap.has(node.parentFullPath)) {
            counts.failed += 1;
            pushDetail('failed', {
              fullPath: node.fullPath,
              reason: `Parent "${node.parentFullPath}" not found`,
              row: node.row,
            });
            continue;
          }

          try {
            const location = await locationService.createLocation(
              {
                name: node.name,
                level: node.level,
                parent_id: node.parentFullPath ? fullPathMap.get(node.parentFullPath)! : null,
              },
              req.user.companyId
            );

            counts.created += 1;
            fullPathMap.set(node.fullPath, location.id);
            pushDetail('created', {
              id: location.id,
              fullPath: location.full_path,
              level: location.level,
            });
          } catch (error: any) {
            counts.failed += 1;
            pushDetail('failed', {
              fullPath: node.fullPath,
              reason: error.message || 'Unknown error',
              row: node.row,
            });
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: `CSV processed successfully. Created ${counts.created}, skipped ${counts.skipped}, failed ${counts.failed}.`,
        data: {
          counts,
          details,
          meta: {
            totalRows: locationNodes.length,
            detailLimit: DETAIL_LIMIT,
            truncated,
          },
        },
      });
    } catch (error: any) {
      return next(error);
    } finally {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => undefined);
      }
    }
  }
}

