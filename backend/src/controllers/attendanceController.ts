import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendanceService';
import { sendSuccess, sendPaginated } from '../utils/response';

const attendanceService = new AttendanceService();

export class AttendanceController {
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const location = req.body.latitude && req.body.longitude
        ? { latitude: parseFloat(req.body.latitude), longitude: parseFloat(req.body.longitude) }
        : undefined;

      const attendance = await attendanceService.checkIn(
        req.user.userId,
        req.user.companyId,
        location
      );
      return sendSuccess(res, attendance, 'Checked in successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const location = req.body.latitude && req.body.longitude
        ? { latitude: parseFloat(req.body.latitude), longitude: parseFloat(req.body.longitude) }
        : undefined;

      const attendance = await attendanceService.checkOut(
        req.user.userId,
        req.user.companyId,
        location
      );
      return sendSuccess(res, attendance, 'Checked out successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  async getAttendances(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await attendanceService.getAttendances(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async getAttendanceById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const attendance = await attendanceService.getAttendanceById(id, req.user.companyId);
      return sendSuccess(res, attendance);
    } catch (error: any) {
      return next(error);
    }
  }

  async getAttendanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = req.params.userId ? parseInt(req.params.userId) : req.user.userId;
      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const report = await attendanceService.getAttendanceReport(
        userId,
        req.user.companyId,
        dateFrom,
        dateTo
      );

      return sendSuccess(res, report);
    } catch (error: any) {
      return next(error);
    }
  }

  async getTeamPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const performance = await attendanceService.getTeamPerformance(
        req.user.companyId,
        dateFrom,
        dateTo
      );

      return sendSuccess(res, performance);
    } catch (error: any) {
      return next(error);
    }
  }

  async logActivity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const activity = await attendanceService.logActivity(
        req.body,
        req.user.companyId,
        req.user.userId
      );
      return sendSuccess(res, activity, 'Activity logged successfully', 201);
    } catch (error: any) {
      return next(error);
    }
  }

  async getUserActivities(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await attendanceService.getUserActivities(
        req.user.companyId,
        req.query,
        req.query
      );

      return sendPaginated(res, result.items, result.pagination);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateAttendanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const attendance = await attendanceService.updateAttendanceStatus(
        id,
        status,
        req.user.companyId,
        notes
      );
      return sendSuccess(res, attendance, 'Attendance status updated successfully');
    } catch (error: any) {
      return next(error);
    }
  }
}

