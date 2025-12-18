import prisma from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { cache } from '../config/redis';
import { config } from '../config/env';

export class ProviderService {
  async linkProvider(
    userId: number,
    provider: string,
    providerAccountId: string,
    providerEmail?: string,
    providerName?: string,
    accessToken?: string,
    refreshToken?: string,
    expiresAt?: Date
  ) {
    // Validate provider
    const validProviders = ['google', 'facebook', 'apple', 'microsoft'];
    if (!validProviders.includes(provider.toLowerCase())) {
      throw new ValidationError(`Invalid provider. Supported: ${validProviders.join(', ')}`);
    }

    // Check if provider account already linked
    const existing = await prisma.providerAccount.findUnique({
      where: {
        provider_provider_account_id: {
          provider: provider.toLowerCase(),
          provider_account_id: providerAccountId,
        },
      },
    });

    if (existing && existing.user_id !== userId) {
      throw new ConflictError('This account is already linked to another user');
    }

    const providerAccount = await prisma.providerAccount.upsert({
      where: {
        provider_provider_account_id: {
          provider: provider.toLowerCase(),
          provider_account_id: providerAccountId,
        },
      },
      update: {
        provider_email: providerEmail,
        provider_name: providerName,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
      create: {
        user_id: userId,
        provider: provider.toLowerCase(),
        provider_account_id: providerAccountId,
        provider_email: providerEmail,
        provider_name: providerName,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
    });

    return providerAccount;
  }

  async unlinkProvider(userId: number, companyId: number, provider: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const providerAccount = await prisma.providerAccount.findFirst({
      where: {
        user_id: userId,
        provider: provider.toLowerCase(),
      },
    });

    if (!providerAccount) {
      throw new NotFoundError('Provider account');
    }

    await prisma.providerAccount.delete({
      where: { id: providerAccount.id },
    });

    return { message: 'Provider account unlinked successfully' };
  }

  async getUserProviders(userId: number, companyId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const providers = await prisma.providerAccount.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        provider: true,
        provider_email: true,
        provider_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    return providers;
  }

  async signupWithProvider(
    provider: string,
    providerAccountId: string,
    email: string,
    name: string,
    companyId: number,
    providerEmail?: string,
    providerName?: string,
    accessToken?: string,
    refreshToken?: string,
    expiresAt?: Date
  ) {
    // Validate provider
    const validProviders = ['google', 'facebook', 'apple', 'microsoft'];
    if (!validProviders.includes(provider.toLowerCase())) {
      throw new ValidationError(`Invalid provider. Supported: ${validProviders.join(', ')}`);
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Link provider to existing user
      await this.linkProvider(
        user.id,
        provider,
        providerAccountId,
        providerEmail || email,
        providerName || name,
        accessToken,
        refreshToken,
        expiresAt
      );
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: '', // No password for OAuth users
          company_id: companyId,
          email_verified: true, // OAuth providers verify email
          provider_accounts: {
            create: {
              provider: provider.toLowerCase(),
              provider_account_id: providerAccountId,
              provider_email: providerEmail || email,
              provider_name: providerName || name,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: expiresAt,
            },
          },
        },
      });
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      roleId: user.role_id || undefined,
      isAdmin: user.is_admin === 'true',
    };

    const generatedAccessToken = generateAccessToken(tokenPayload);
    const generatedRefreshToken = generateRefreshToken(tokenPayload);

    // Store tokens
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1);

    await prisma.oAuthToken.create({
      data: {
        user_id: user.id,
        access_token: generatedAccessToken,
        refresh_token: generatedRefreshToken,
        expires_at: tokenExpiresAt,
      },
    });

    // Cache token
    await cache.set(`oauth:token:${generatedAccessToken}`, tokenPayload, config.REDIS_TTL_SESSION);

    return {
      access_token: generatedAccessToken,
      refresh_token: generatedRefreshToken,
      token_type: 'Bearer',
      expires_in: config.REDIS_TTL_SESSION,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: {
          id: user.company_id,
        },
      },
    };
  }
}

