import { Request, Response, NextFunction } from 'express';
import { MasterDataService } from '../services/masterDataService';
import { sendSuccess, sendPaginated } from '../utils/response';

const masterDataService = new MasterDataService();

export class MasterDataController {
  // Countries
  async getCountries(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getCountries(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createCountry(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const country = await masterDataService.createCountry(req.body, req.user.companyId);
      return sendSuccess(res, country, 'Country created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateCountry(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const country = await masterDataService.updateCountry(id, req.body, req.user.companyId);
      return sendSuccess(res, country, 'Country updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteCountry(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteCountry(id, req.user.companyId);
      return sendSuccess(res, null, 'Country deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // States
  async getStates(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getStates(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createState(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const state = await masterDataService.createState(req.body, req.user.companyId);
      return sendSuccess(res, state, 'State created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateState(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const state = await masterDataService.updateState(id, req.body, req.user.companyId);
      return sendSuccess(res, state, 'State updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteState(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteState(id, req.user.companyId);
      return sendSuccess(res, null, 'State deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Areas
  async getAreas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getAreas(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createArea(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const area = await masterDataService.createArea(req.body, req.user.companyId);
      return sendSuccess(res, area, 'Area created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateArea(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const area = await masterDataService.updateArea(id, req.body, req.user.companyId);
      return sendSuccess(res, area, 'Area updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteArea(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteArea(id, req.user.companyId);
      return sendSuccess(res, null, 'Area deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Unit Types
  async getUnitTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getUnitTypes(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createUnitType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const unitType = await masterDataService.createUnitType(req.body, req.user.companyId);
      return sendSuccess(res, unitType, 'Unit Type created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateUnitType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const unitType = await masterDataService.updateUnitType(id, req.body, req.user.companyId);
      return sendSuccess(res, unitType, 'Unit Type updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteUnitType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteUnitType(id, req.user.companyId);
      return sendSuccess(res, null, 'Unit Type deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Amenities
  async getAmenities(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getAmenities(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const amenity = await masterDataService.createAmenity(req.body, req.user.companyId);
      return sendSuccess(res, amenity, 'Amenity created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const amenity = await masterDataService.updateAmenity(id, req.body, req.user.companyId);
      return sendSuccess(res, amenity, 'Amenity updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteAmenity(id, req.user.companyId);
      return sendSuccess(res, null, 'Amenity deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Maintenance Types
  async getMaintenanceTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getMaintenanceTypes(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const type = await masterDataService.createMaintenanceType(req.body, req.user.companyId);
      return sendSuccess(res, type, 'Maintenance Type created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const type = await masterDataService.updateMaintenanceType(id, req.body, req.user.companyId);
      return sendSuccess(res, type, 'Maintenance Type updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteMaintenanceType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteMaintenanceType(id, req.user.companyId);
      return sendSuccess(res, null, 'Maintenance Type deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Maintenance Statuses
  async getMaintenanceStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getMaintenanceStatuses(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const status = await masterDataService.createMaintenanceStatus(req.body, req.user.companyId);
      return sendSuccess(res, status, 'Maintenance Status created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const status = await masterDataService.updateMaintenanceStatus(id, req.body, req.user.companyId);
      return sendSuccess(res, status, 'Maintenance Status updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteMaintenanceStatus(id, req.user.companyId);
      return sendSuccess(res, null, 'Maintenance Status deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Complaint Statuses
  async getComplaintStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getComplaintStatuses(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createComplaintStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const status = await masterDataService.createComplaintStatus(req.body, req.user.companyId);
      return sendSuccess(res, status, 'Complaint Status created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateComplaintStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const status = await masterDataService.updateComplaintStatus(id, req.body, req.user.companyId);
      return sendSuccess(res, status, 'Complaint Status updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteComplaintStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteComplaintStatus(id, req.user.companyId);
      return sendSuccess(res, null, 'Complaint Status deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Lead Statuses
  async getLeadStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getLeadStatuses(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const status = await masterDataService.createLeadStatus(req.body, req.user.companyId);
      return sendSuccess(res, status, 'Lead Status created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const status = await masterDataService.updateLeadStatus(id, req.body, req.user.companyId);
      return sendSuccess(res, status, 'Lead Status updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteLeadStatus(id, req.user.companyId);
      return sendSuccess(res, null, 'Lead Status deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Activity Sources
  async getActivitySources(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getActivitySources(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createActivitySource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const source = await masterDataService.createActivitySource(req.body, req.user.companyId);
      return sendSuccess(res, source, 'Activity Source created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateActivitySource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const source = await masterDataService.updateActivitySource(id, req.body, req.user.companyId);
      return sendSuccess(res, source, 'Activity Source updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteActivitySource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteActivitySource(id, req.user.companyId);
      return sendSuccess(res, null, 'Activity Source deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Followup Types
  async getFollowupTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getFollowupTypes(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createFollowupType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const type = await masterDataService.createFollowupType(req.body, req.user.companyId);
      return sendSuccess(res, type, 'Followup Type created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateFollowupType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const type = await masterDataService.updateFollowupType(id, req.body, req.user.companyId);
      return sendSuccess(res, type, 'Followup Type updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteFollowupType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteFollowupType(id, req.user.companyId);
      return sendSuccess(res, null, 'Followup Type deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Request Types
  async getRequestTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getRequestTypes(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createRequestType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const type = await masterDataService.createRequestType(req.body, req.user.companyId);
      return sendSuccess(res, type, 'Request Type created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateRequestType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const type = await masterDataService.updateRequestType(id, req.body, req.user.companyId);
      return sendSuccess(res, type, 'Request Type updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteRequestType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteRequestType(id, req.user.companyId);
      return sendSuccess(res, null, 'Request Type deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Request Statuses
  async getRequestStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getRequestStatuses(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const status = await masterDataService.createRequestStatus(req.body, req.user.companyId);
      return sendSuccess(res, status, 'Request Status created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const status = await masterDataService.updateRequestStatus(id, req.body, req.user.companyId);
      return sendSuccess(res, status, 'Request Status updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteRequestStatus(id, req.user.companyId);
      return sendSuccess(res, null, 'Request Status deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // KYC Document Types
  async getKycDocTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const result = await masterDataService.getKycDocTypes(req.user.companyId, req.query, req.query);
      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async createKycDocType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const docType = await masterDataService.createKycDocType(req.body, req.user.companyId);
      return sendSuccess(res, docType, 'KYC Document Type created successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateKycDocType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      const docType = await masterDataService.updateKycDocType(id, req.body, req.user.companyId);
      return sendSuccess(res, docType, 'KYC Document Type updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteKycDocType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const id = parseInt(req.params.id);
      await masterDataService.deleteKycDocType(id, req.user.companyId);
      return sendSuccess(res, null, 'KYC Document Type deleted successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

