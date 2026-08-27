import jwt, { type SignOptions } from 'jsonwebtoken';

import { ACCESS_TOKEN_TYPE } from '../common/constants/auth.constants.js';
import { AppError } from '../common/errors/app-error.js';
import type { AppConfig } from '../config/index.js';
import type { AccessTokenPayload, AuthenticatedUser } from '../types/auth.types.js';
import { parseExpiresInToSeconds } from './tokens.js';

export function signAccessToken(user: AuthenticatedUser, appConfig: AppConfig): string {
  const payload: AccessTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: ACCESS_TOKEN_TYPE,
  };

  const options: SignOptions = {
    expiresIn: parseExpiresInToSeconds(appConfig.jwt.accessExpiresIn),
    subject: user.id,
    issuer: 'portfolio-api',
    audience: 'portfolio-admin',
  };

  return jwt.sign(payload, appConfig.jwt.accessSecret, options);
}

export function verifyAccessToken(token: string, appConfig: AppConfig): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, appConfig.jwt.accessSecret, {
      issuer: 'portfolio-api',
      audience: 'portfolio-admin',
    });

    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      throw AppError.unauthorized('Invalid access token');
    }

    const payload = decoded as AccessTokenPayload;

    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw AppError.unauthorized('Invalid access token type');
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function getAccessTokenExpiresInSeconds(appConfig: AppConfig): number {
  return parseExpiresInToSeconds(appConfig.jwt.accessExpiresIn);
}
