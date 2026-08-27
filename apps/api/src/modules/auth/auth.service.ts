import type { User } from '@prisma/client';

import { AppError } from '../../common/errors/app-error.js';
import type { AppConfig } from '../../config/index.js';
import { getAccessTokenExpiresInSeconds, signAccessToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';
import {
  generateCsrfToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from '../../lib/tokens.js';
import type {
  AuthTokens,
  AuthUserResponse,
  LoginResponse,
  RequestMetadata,
} from '../../types/auth.types.js';
import type { AuthRepository } from './auth.repository.js';
import type { LoginBody } from './auth.schema.js';

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly appConfig: AppConfig,
  ) {}

  async login(input: LoginBody, metadata: RequestMetadata): Promise<LoginResponse & { refreshToken: string }> {
    const user = await this.authRepository.findActiveUserByEmail(input.email);

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);

    if (!passwordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    await this.authRepository.updateLastLogin(user.id);

    const tokens = await this.issueTokenPair(user, metadata);

    return {
      ...tokens,
      user: this.toAuthUser(user),
    };
  }

  async refresh(refreshToken: string, metadata: RequestMetadata): Promise<AuthTokens & { refreshToken: string }> {
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await this.authRepository.findActiveRefreshToken(tokenHash);

    if (!storedToken || storedToken.user.deletedAt) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);

    return this.issueTokenPair(storedToken.user, metadata);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashRefreshToken(refreshToken);
    await this.authRepository.revokeRefreshTokenByHash(tokenHash);
  }

  async getCurrentUser(userId: string): Promise<AuthUserResponse> {
    const user = await this.authRepository.findActiveUserById(userId);

    if (!user) {
      throw AppError.unauthorized('User account not found');
    }

    return this.toAuthUser(user);
  }

  private async issueTokenPair(
    user: User,
    metadata: RequestMetadata,
  ): Promise<AuthTokens & { refreshToken: string }> {
    const authUser = this.toAuthUser(user);
    const refreshToken = generateRefreshToken();
    const csrfToken = generateCsrfToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt: getRefreshTokenExpiry(this.appConfig.jwt.refreshExpiresDays),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    const accessToken = signAccessToken(authUser, this.appConfig);

    return {
      accessToken,
      accessTokenExpiresIn: getAccessTokenExpiresInSeconds(this.appConfig),
      csrfToken,
      refreshToken,
    };
  }

  private toAuthUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
