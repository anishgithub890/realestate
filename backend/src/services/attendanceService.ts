import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class AttendanceService {
  /**
   * Check in user
   */
  async checkIn(userId: number, companyId: number, location?: { latitude: number; longitude: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already exists for today
    const existing = await prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
    });

    if (existing && existing.check_in_time) {
      throw new ValidationError('User has already checked in today');
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
      update: {
        check_in_time: new Date(),
        check_in_latitude: location?.latitude || null,
        check_in_longitude: location?.longitude || null,
        status: 'present',
      },
      create: {
        user_id: userId,
        company_id: companyId,
        date: today,
        check_in_time: new Date(),
        check_in_latitude: location?.latitude || null,
        check_in_longitude: location?.longitude || null,
        status: 'present',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return attendance;
  }

  /**
   * Check out user
   */
  async checkOut(userId: number, _companyId: number, location?: { latitude: number; longitude: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundError('Attendance record not found. Please check in first.');
    }

    if (attendance.check_out_time) {
      throw new ValidationError('User has already checked out today');
    }

    const updatedAttendance = await prisma.attendance.update({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
      data: {
        check_out_time: new Date(),
        check_out_latitude: location?.latitude || null,
        check_out_longitude: location?.longitude || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedAttendance;
  }

  /**
   * Get attendance records
   */
  async getAttendances(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.user_id) {
      where.user_id = parseInt(filters.user_id);
    }

    if (filters.date_from) {
      where.date = { gte: new Date(filters.date_from) };
    }

    if (filters.date_to) {
      where.date = {
        ...where.date,
        lte: new Date(filters.date_to),
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'date', sortOrder || 'desc'),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      items: attendances,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get attendance by ID
   */
  async getAttendanceById(id: number, companyId: number) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundError('Attendance');
    }

    return attendance;
  }

  /**
   * Get attendance report for user
   */
  async getAttendanceReport(userId: number, companyId: number, dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      user_id: userId,
      company_id: companyId,
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === 'present').length;
    const absentDays = attendances.filter((a) => a.status === 'absent').length;
    const lateDays = attendances.filter((a) => a.status === 'late').length;
    const halfDays = attendances.filter((a) => a.status === 'half_day').length;

    return {
      user_id: userId,
      date_from: dateFrom,
      date_to: dateTo,
      total_days: totalDays,
      present_days: presentDays,
      absent_days: absentDays,
      late_days: lateDays,
      half_days: halfDays,
      attendance_rate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      attendances,
    };
  }

  /**
   * Get team performance
   */
  async getTeamPerformance(companyId: number, dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      company_id: companyId,
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by user
    const userStats: { [key: number]: any } = {};

    attendances.forEach((attendance) => {
      if (!userStats[attendance.user_id]) {
        userStats[attendance.user_id] = {
          user: attendance.user,
          total_days: 0,
          present_days: 0,
          absent_days: 0,
          late_days: 0,
          half_days: 0,
        };
      }

      userStats[attendance.user_id].total_days++;
      if (attendance.status === 'present') userStats[attendance.user_id].present_days++;
      if (attendance.status === 'absent') userStats[attendance.user_id].absent_days++;
      if (attendance.status === 'late') userStats[attendance.user_id].late_days++;
      if (attendance.status === 'half_day') userStats[attendance.user_id].half_days++;
    });

    // Calculate attendance rate for each user
    const teamPerformance = Object.values(userStats).map((stats: any) => ({
      ...stats,
      attendance_rate: stats.total_days > 0 ? (stats.present_days / stats.total_days) * 100 : 0,
    }));

    return teamPerformance;
  }

  /**
   * Log user activity
   */
  async logActivity(data: any, companyId: number, userId: number) {
    let metadata;
    if (data.metadata) {
      try {
        metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
      } catch (error) {
        throw new ValidationError('Invalid metadata JSON');
      }
    }

    const activity = await prisma.userActivity.create({
      data: {
        user_id: userId,
        company_id: companyId,
        date: data.date ? new Date(data.date) : new Date(),
        activity_type: data.activity_type,
        description: data.description,
        duration_minutes: data.duration_minutes || null,
        metadata: metadata ? (metadata as any) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return activity;
  }

  /**
   * Get user activities
   */
  async getUserActivities(companyId: number, pagination: any, filters: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const where: any = {
      company_id: companyId,
    };

    if (filters.user_id) {
      where.user_id = parseInt(filters.user_id);
    }

    if (filters.activity_type) {
      where.activity_type = filters.activity_type;
    }

    if (filters.date_from) {
      where.date = { gte: new Date(filters.date_from) };
    }

    if (filters.date_to) {
      where.date = {
        ...where.date,
        lte: new Date(filters.date_to),
      };
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take,
        orderBy: buildOrderBy(sortBy || 'created_at', sortOrder || 'desc'),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.userActivity.count({ where }),
    ]);

    return {
      items: activities,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Update attendance status
   */
  async updateAttendanceStatus(id: number, status: string, companyId: number, notes?: string) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!attendance) {
      throw new NotFoundError('Attendance');
    }

    const validStatuses = ['present', 'absent', 'late', 'half_day'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`);
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        notes: notes || attendance.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedAttendance;
  }
}

