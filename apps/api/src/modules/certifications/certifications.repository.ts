import type { Certification, Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class CertificationsRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(args: Prisma.CertificationFindManyArgs): Promise<Certification[]> {
    return this.prisma.certification.findMany(args);
  }

  findById(id: string): Promise<Certification | null> {
    return this.prisma.certification.findUnique({ where: { id } });
  }

  create(data: Prisma.CertificationCreateInput): Promise<Certification> {
    return this.prisma.certification.create({ data });
  }

  update(id: string, data: Prisma.CertificationUpdateInput): Promise<Certification> {
    return this.prisma.certification.update({ where: { id }, data });
  }

  delete(id: string): Promise<void> {
    return this.prisma.certification.delete({ where: { id } }).then(() => undefined);
  }
}
