import type { PrismaClient } from '@prisma/client';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaClient) {}
}
