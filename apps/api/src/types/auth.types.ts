import type { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AccessTokenPayload = AuthenticatedUser & {
  type: 'access';
};

export type RequestMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export type AuthTokens = {
  accessToken: string;
  accessTokenExpiresIn: number;
  csrfToken: string;
};

export type AuthUserResponse = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginResponse = AuthTokens & {
  user: AuthUserResponse;
};
