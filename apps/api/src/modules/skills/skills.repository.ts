import type { Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

const skillInclude = {
  skillCategory: true,
} satisfies Prisma.SkillInclude;

export type SkillWithRelations = Prisma.SkillGetPayload<{ include: typeof skillInclude }>;

export class SkillsRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(args: Prisma.SkillFindManyArgs) {
    return this.prisma.skill.findMany(args);
  }

  findById(id: string): Promise<SkillWithRelations | null> {
    return this.prisma.skill.findUnique({
      where: { id },
      include: skillInclude,
    });
  }

  create(data: Prisma.SkillCreateInput): Promise<SkillWithRelations> {
    return this.prisma.skill.create({ data, include: skillInclude });
  }

  update(id: string, data: Prisma.SkillUpdateInput): Promise<SkillWithRelations> {
    return this.prisma.skill.update({ where: { id }, data, include: skillInclude });
  }

  delete(id: string): Promise<void> {
    return this.prisma.skill.delete({ where: { id } }).then(() => undefined);
  }

  categoryExists(id: string): Promise<boolean> {
    return this.prisma.skillCategory
      .findUnique({ where: { id }, select: { id: true } })
      .then((category) => Boolean(category));
  }
}

export { skillInclude };
