import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { parsePagination, buildOrderBy } from '../utils/pagination';

export class SessionService {
  async createSession(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
    deviceType?: string,
    deviceName?: string,
    expiresInDays: number = 7
  ) {
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const session = await prisma.session.create({
      data: {
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        device_name: deviceName,
        expires_at: expiresAt,
      },
    });

    return session;
  }

  async getSession(sessionToken: string) {
    const session = await prisma.session.findUnique({
      where: { session_token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            is_admin: true,
            company_id: true,
            role_id: true,
          },
        },
      },
    });

    if (!session || !session.is_active || session.expires_at < new Date()) {
      return null;
    }

    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { last_activity: new Date() },
    });

    return session;
  }

  async getUserSessions(userId: number, companyId: number, pagination: any) {
    const { skip, take, page, limit, sortBy, sortOrder } = parsePagination(pagination);

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() },
        },
        skip,
        take,
        orderBy: buildOrderBy(sortBy, sortOrder),
      }),
      prisma.session.count({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() },
        },
      }),
    ]);

    return {
      items: sessions,
      pagination: { page, limit, total },
    };
  }

  async revokeSession(sessionToken: string, userId: number, companyId: number) {
    const session = await prisma.session.findFirst({
      where: {
        session_token: sessionToken,
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.user.company_id !== companyId) {
      throw new NotFoundError('Session');
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { is_active: false },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllSessions(userId: number, companyId: number, exceptSessionToken?: string) {
    const where: any = {
      user_id: userId,
      is_active: true,
    };

    if (exceptSessionToken) {
      where.session_token = { not: exceptSessionToken };
    }

    await prisma.session.updateMany({
      where,
      data: { is_active: false },
    });

    return { message: 'All sessions revoked successfully' };
  }

  async cleanupExpiredSessions() {
    const result = await prisma.session.updateMany({
      where: {
        expires_at: { lt: new Date() },
        is_active: true,
      },
      data: { is_active: false },
    });

    return { cleaned: result.count };
  }

  async getSessionStats(userId: number, companyId: number) {
    const [total, active, expired] = await Promise.all([
      prisma.session.count({
        where: { user_id: userId },
      }),
      prisma.session.count({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() },
        },
      }),
      prisma.session.count({
        where: {
          user_id: userId,
          OR: [
            { is_active: false },
            { expires_at: { lt: new Date() } },
          ],
        },
      }),
    ]);

    return {
      total,
      active,
      expired,
    };
  }
}

