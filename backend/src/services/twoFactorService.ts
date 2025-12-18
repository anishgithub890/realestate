import prisma from '../config/database';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { generateTOTPSecret, generateTOTPURL, verifyTOTP, generateBackupCodes, verifyBackupCode } from '../utils/twoFactor';

export class TwoFactorService {
  async enable2FA(userId: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.two_factor_enabled) {
      throw new ValidationError('2FA is already enabled');
    }

    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes(10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_secret: secret,
        two_factor_backup_codes: JSON.stringify(backupCodes),
      },
    });

    const totpURL = generateTOTPURL(user.email, secret);

    return {
      secret,
      qr_code_url: totpURL,
      backup_codes: backupCodes,
      message: 'Save these backup codes in a safe place. You will need them if you lose access to your authenticator app.',
    };
  }

  async verifyAndEnable2FA(userId: number, companyId: number, token: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user || !user.two_factor_secret) {
      throw new NotFoundError('User or 2FA secret not found');
    }

    const isValid = verifyTOTP(token, user.two_factor_secret);

    if (!isValid) {
      throw new UnauthorizedError('Invalid 2FA token');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: true,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: number, companyId: number, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify password if provided
    if (user.password) {
      const { comparePassword } = require('../utils/password');
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new UnauthorizedError('Invalid password');
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  async verify2FA(userId: number, token: string, useBackupCode: boolean = false) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.two_factor_enabled) {
      throw new NotFoundError('User or 2FA not enabled');
    }

    if (useBackupCode) {
      if (!user.two_factor_backup_codes) {
        throw new ValidationError('No backup codes available');
      }

      const backupCodes = JSON.parse(user.two_factor_backup_codes);
      const isValid = verifyBackupCode(token, backupCodes);

      if (!isValid) {
        throw new UnauthorizedError('Invalid backup code');
      }

      // Remove used backup code
      const updatedCodes = backupCodes.filter((code: string) => code !== token.toUpperCase());
      await prisma.user.update({
        where: { id: userId },
        data: {
          two_factor_backup_codes: JSON.stringify(updatedCodes),
        },
      });

      return { verified: true, message: 'Backup code verified' };
    } else {
      if (!user.two_factor_secret) {
        throw new ValidationError('2FA secret not found');
      }

      const isValid = verifyTOTP(token, user.two_factor_secret);

      if (!isValid) {
        throw new UnauthorizedError('Invalid 2FA token');
      }

      return { verified: true, message: '2FA token verified' };
    }
  }

  async regenerateBackupCodes(userId: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
        two_factor_enabled: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User or 2FA not enabled');
    }

    const backupCodes = generateBackupCodes(10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_backup_codes: JSON.stringify(backupCodes),
      },
    });

    return {
      backup_codes: backupCodes,
      message: 'New backup codes generated. Save them in a safe place.',
    };
  }

  async get2FAStatus(userId: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
      select: {
        id: true,
        email: true,
        two_factor_enabled: true,
        two_factor_backup_codes: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      enabled: user.two_factor_enabled,
      backup_codes_count: user.two_factor_backup_codes
        ? JSON.parse(user.two_factor_backup_codes).length
        : 0,
    };
  }
}

