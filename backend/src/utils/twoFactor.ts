import crypto from 'crypto';
import { authenticator } from 'otplib';

// Generate TOTP secret
export const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

// Generate TOTP URL for QR code
export const generateTOTPURL = (email: string, secret: string, issuer: string = 'Real Estate Management'): string => {
  return authenticator.keyuri(email, issuer, secret);
};

// Verify TOTP token
export const verifyTOTP = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
};

// Generate backup codes
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Verify backup code
export const verifyBackupCode = (code: string, backupCodes: string[]): boolean => {
  return backupCodes.includes(code.toUpperCase());
};

