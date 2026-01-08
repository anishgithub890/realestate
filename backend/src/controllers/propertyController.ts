import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/propertyService';
import { sendSuccess, sendPaginated } from '../utils/response';

const propertyService = new PropertyService();

export class PropertyController {
  // Building endpoints
  async getBuildings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await propertyService.getBuildings(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getBuildingById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const building = await propertyService.getBuildingById(id, req.user.companyId);
      sendSuccess(res, building);
    } catch (error: any) {
      next(error);
    }
  }

  async createBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const building = await propertyService.createBuilding(req.body, req.user.companyId);
      sendSuccess(res, building, 'Building created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const building = await propertyService.updateBuilding(id, req.body, req.user.companyId);
      sendSuccess(res, building, 'Building updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const result = await propertyService.deleteBuilding(id, req.user.companyId);
      sendSuccess(res, result, 'Building deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Unit endpoints
  async getUnits(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await propertyService.getUnits(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async getAvailableUnits(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const units = await propertyService.getAvailableUnits(req.user.companyId, req.query);
      sendSuccess(res, units);
    } catch (error: any) {
      next(error);
    }
  }

  async getUnitById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const unit = await propertyService.getUnitById(id, req.user.companyId);
      sendSuccess(res, unit);
    } catch (error: any) {
      next(error);
    }
  }

  async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unit = await propertyService.createUnit(req.body, req.user.companyId);
      sendSuccess(res, unit, 'Unit created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const unit = await propertyService.updateUnit(id, req.body, req.user.companyId);
      sendSuccess(res, unit, 'Unit updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const result = await propertyService.deleteUnit(id, req.user.companyId);
      sendSuccess(res, result, 'Unit deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Floor endpoints
  async getFloors(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const buildingId = parseInt(req.params.buildingId);
      const floors = await propertyService.getFloors(buildingId, req.user.companyId);
      sendSuccess(res, floors);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllFloors(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const result = await propertyService.getAllFloors(req.user.companyId, req.query, req.query);
      sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      next(error);
    }
  }

  async createFloor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const floor = await propertyService.createFloor(req.body, req.user.companyId);
      sendSuccess(res, floor, 'Floor created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getFloorById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const floor = await propertyService.getFloorById(id, req.user.companyId);
      sendSuccess(res, floor);
    } catch (error: any) {
      next(error);
    }
  }

  async updateFloor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const floor = await propertyService.updateFloor(id, req.body, req.user.companyId);
      sendSuccess(res, floor, 'Floor updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteFloor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const id = parseInt(req.params.id);
      const result = await propertyService.deleteFloor(id, req.user.companyId);
      sendSuccess(res, result, 'Floor deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  // Unit Type endpoints
  async getUnitTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitTypes = await propertyService.getUnitTypes(req.user.companyId);
      sendSuccess(res, unitTypes);
    } catch (error: any) {
      next(error);
    }
  }

  async createUnitType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitType = await propertyService.createUnitType(req.body, req.user.companyId);
      sendSuccess(res, unitType, 'Unit type created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  // Amenity endpoints
  async getAmenities(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const amenities = await propertyService.getAmenities(req.user.companyId);
      sendSuccess(res, amenities);
    } catch (error: any) {
      next(error);
    }
  }

  async createAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const amenity = await propertyService.createAmenity(req.body, req.user.companyId);
      sendSuccess(res, amenity, 'Amenity created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  // Parking endpoints
  async getParkings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const buildingId = req.query.building_id ? parseInt(req.query.building_id as string) : undefined;
      const parkings = await propertyService.getParkings(req.user.companyId, buildingId);
      sendSuccess(res, parkings);
    } catch (error: any) {
      next(error);
    }
  }

  async createParking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const parking = await propertyService.createParking(req.body, req.user.companyId);
      sendSuccess(res, parking, 'Parking created successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  // Unit Images
  async getUnitImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitId = parseInt(req.params.unitId);
      const images = await propertyService.getUnitImages(unitId, req.user.companyId);
      sendSuccess(res, images);
    } catch (error: any) {
      next(error);
    }
  }

  async addUnitImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitId = parseInt(req.params.unitId);
      const { image_url, image_type, caption } = req.body;

      if (!image_url || !image_type) {
        return res.status(400).json({ success: false, error: 'image_url and image_type are required' });
      }

      const image = await propertyService.addUnitImage(unitId, image_url, image_type, caption, req.user.companyId);
      sendSuccess(res, image, 'Image added successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateUnitImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const imageId = parseInt(req.params.imageId);
      const unitId = parseInt(req.params.unitId);
      const image = await propertyService.updateUnitImage(imageId, unitId, req.body, req.user.companyId);
      sendSuccess(res, image, 'Image updated successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async deleteUnitImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const imageId = parseInt(req.params.imageId);
      const unitId = parseInt(req.params.unitId);
      const result = await propertyService.deleteUnitImage(imageId, unitId, req.user.companyId);
      sendSuccess(res, result, 'Image deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async reorderUnitImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitId = parseInt(req.params.unitId);
      const { image_ids } = req.body;

      if (!Array.isArray(image_ids)) {
        return res.status(400).json({ success: false, error: 'image_ids must be an array' });
      }

      const result = await propertyService.reorderUnitImages(unitId, image_ids, req.user.companyId);
      sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  // Unit Documents
  async getUnitDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitId = parseInt(req.params.unitId);
      const documents = await propertyService.getUnitDocuments(unitId, req.user.companyId);
      sendSuccess(res, documents);
    } catch (error: any) {
      next(error);
    }
  }

  async addUnitDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const unitId = parseInt(req.params.unitId);
      const { doc_type, document_url, document_name, expiry_date } = req.body;

      if (!doc_type || !document_url) {
        return res.status(400).json({ success: false, error: 'doc_type and document_url are required' });
      }

      const document = await propertyService.addUnitDocument(
        unitId,
        doc_type,
        document_url,
        document_name,
        expiry_date ? new Date(expiry_date) : null,
        req.user.companyId
      );
      sendSuccess(res, document, 'Document added successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteUnitDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const docId = parseInt(req.params.docId);
      const unitId = parseInt(req.params.unitId);
      const result = await propertyService.deleteUnitDocument(docId, unitId, req.user.companyId);
      sendSuccess(res, result, 'Document deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }
}

