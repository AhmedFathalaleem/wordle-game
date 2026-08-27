import type { PrismaClient, User } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class AuthRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findActiveUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findActiveUserById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  updateLastLogin(userId: string): Promise<void> {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      })
      .then(() => undefined);
  }

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  findActiveRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  revokeRefreshToken(id: string): Promise<void> {
    return this.prisma.refreshToken
      .update({
        where: { id },
        data: { revokedAt: new Date() },
      })
      .then(() => undefined);
  }

  revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
    return this.prisma.refreshToken
      .updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      })
      .then(() => undefined);
  }
}
