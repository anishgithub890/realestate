import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { cache } from '../config/redis';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async login(email: string, password: string, companyId?: number, twoFactorToken?: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.is_active === 'false') {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedError('Password not set. Please use provider login or set a password.');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check company
    if (companyId && user.company_id !== companyId) {
      throw new UnauthorizedError('User does not belong to this company');
    }

    // Check 2FA if enabled
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        throw new UnauthorizedError('2FA token required');
      }

      const { verifyTOTP, verifyBackupCode } = require('../utils/twoFactor');
      
      if (!user.two_factor_secret) {
        throw new UnauthorizedError('2FA not properly configured');
      }

      // Try TOTP first, then backup code
      const isValidTOTP = verifyTOTP(twoFactorToken, user.two_factor_secret);
      let isValidBackup = false;

      if (!isValidTOTP && user.two_factor_backup_codes) {
        const backupCodes = JSON.parse(user.two_factor_backup_codes);
        isValidBackup = verifyBackupCode(twoFactorToken, backupCodes);
        
        if (isValidBackup) {
          // Remove used backup code
          const updatedCodes = backupCodes.filter((code: string) => code !== twoFactorToken.toUpperCase());
          await prisma.user.update({
            where: { id: user.id },
            data: {
              two_factor_backup_codes: JSON.stringify(updatedCodes),
            },
          });
        }
      }

      if (!isValidTOTP && !isValidBackup) {
        throw new UnauthorizedError('Invalid 2FA token');
      }
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      roleId: user.role_id || undefined,
      isAdmin: user.is_admin === 'true',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store tokens in database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.oAuthToken.create({
      data: {
        user_id: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
    });

    // Cache token in Redis
    await cache.set(`oauth:token:${accessToken}`, tokenPayload, config.REDIS_TTL_SESSION);

    // Cache user session
    const sessionKey = `session:${user.id}:${user.company_id}`;
    await cache.set(sessionKey, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.role_id,
        isAdmin: user.is_admin === 'true',
      },
      company: {
        id: user.company.id,
        name: user.company.name,
      },
    }, config.REDIS_TTL_SESSION);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: config.REDIS_TTL_SESSION,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
        } : null,
        company: {
          id: user.company.id,
          name: user.company.name,
        },
      },
    };
  }

  async oauth2Token(
    grantType: string,
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    companyId?: number,
    twoFactorToken?: string
  ) {
    // Validate OAuth2 client
    if (clientId !== config.OAUTH2_CLIENT_ID || clientSecret !== config.OAUTH2_CLIENT_SECRET) {
      throw new UnauthorizedError('Invalid client credentials');
    }

    if (grantType !== 'password') {
      throw new ValidationError('Unsupported grant type. Only "password" is supported');
    }

    // Perform login
    return this.login(username, password, companyId, twoFactorToken);
  }

  async logout(accessToken: string) {
    // Remove from Redis
    await cache.del(`oauth:token:${accessToken}`);

    // Remove from database
    await prisma.oAuthToken.deleteMany({
      where: { access_token: accessToken },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    // Find token in database
    const tokenRecord = await prisma.oAuthToken.findUnique({
      where: { refresh_token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      roleId: user.role_id || undefined,
      isAdmin: user.is_admin === 'true',
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update tokens
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.oAuthToken.update({
      where: { refresh_token: refreshToken },
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: expiresAt,
      },
    });

    // Cache new token
    await cache.set(`oauth:token:${newAccessToken}`, tokenPayload, config.REDIS_TTL_SESSION);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: config.REDIS_TTL_SESSION,
    };
  }

  async getCurrentUser(userId: number, companyId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    if (!user || user.company_id !== companyId) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin === 'true',
      is_active: user.is_active === 'true',
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        })),
      } : null,
      company: {
        id: user.company.id,
        name: user.company.name,
      },
    };
  }

  async getCompanies(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // For now, return user's company. In multi-tenant, this would return all companies user has access to
    return [{
      id: user.company.id,
      name: user.company.name,
    }];
  }

  async selectCompany(userId: number, companyId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify user has access to company
    if (user.company_id !== companyId) {
      throw new UnauthorizedError('User does not have access to this company');
    }

    return {
      message: 'Company selected successfully',
      company: {
        id: companyId,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 hour expiry

    // Store reset token in Redis
    await cache.set(`password_reset:${resetToken}`, {
      userId: user.id,
      email: user.email,
    }, 3600);

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    // Get reset token from Redis
    const resetData = await cache.get<{ userId: number; email: string }>(`password_reset:${resetToken}`);

    if (!resetData) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: resetData.userId },
      data: { password: hashedPassword },
    });

    // Remove reset token
    await cache.del(`password_reset:${resetToken}`);

    return { message: 'Password reset successfully' };
  }
}

