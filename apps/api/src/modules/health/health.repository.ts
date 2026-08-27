import type { PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class HealthRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async pingDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
