import type { Prisma, PrismaClient, SiteSettings } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class SiteSettingsRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findFirst(): Promise<SiteSettings | null> {
    return this.prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string): Promise<SiteSettings | null> {
    return this.prisma.siteSettings.findUnique({ where: { id } });
  }

  create(data: Prisma.SiteSettingsCreateInput): Promise<SiteSettings> {
    return this.prisma.siteSettings.create({ data });
  }

  update(id: string, data: Prisma.SiteSettingsUpdateInput): Promise<SiteSettings> {
    return this.prisma.siteSettings.update({ where: { id }, data });
  }
}
