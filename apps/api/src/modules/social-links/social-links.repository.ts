import type { Prisma, PrismaClient, SocialLink } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class SocialLinksRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(args: Prisma.SocialLinkFindManyArgs): Promise<SocialLink[]> {
    return this.prisma.socialLink.findMany(args);
  }

  findById(id: string): Promise<SocialLink | null> {
    return this.prisma.socialLink.findUnique({ where: { id } });
  }

  create(data: Prisma.SocialLinkCreateInput): Promise<SocialLink> {
    return this.prisma.socialLink.create({ data });
  }

  update(id: string, data: Prisma.SocialLinkUpdateInput): Promise<SocialLink> {
    return this.prisma.socialLink.update({ where: { id }, data });
  }

  delete(id: string): Promise<void> {
    return this.prisma.socialLink.delete({ where: { id } }).then(() => undefined);
  }
}
