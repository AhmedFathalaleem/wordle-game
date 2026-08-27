import type { Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

const projectInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  technologies: { include: { technology: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

export class ProjectsRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(args: Prisma.ProjectFindManyArgs) {
    return this.prisma.project.findMany(args);
  }

  findById(id: string, includeDeleted = false): Promise<ProjectWithRelations | null> {
    return this.prisma.project.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: projectInclude,
    });
  }

  findBySlug(slug: string, includeDeleted = false): Promise<ProjectWithRelations | null> {
    return this.prisma.project.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: projectInclude,
    });
  }

  create(data: Prisma.ProjectCreateInput): Promise<ProjectWithRelations> {
    return this.prisma.project.create({
      data,
      include: projectInclude,
    });
  }

  update(id: string, data: Prisma.ProjectUpdateInput): Promise<ProjectWithRelations> {
    return this.prisma.project.update({
      where: { id },
      data,
      include: projectInclude,
    });
  }

  softDelete(id: string): Promise<void> {
    return this.prisma.project
      .update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      .then(() => undefined);
  }

  setTechnologies(projectId: string, technologyIds: string[]): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      await tx.projectTechnology.deleteMany({ where: { projectId } });

      if (technologyIds.length > 0) {
        await tx.projectTechnology.createMany({
          data: technologyIds.map((technologyId) => ({ projectId, technologyId })),
          skipDuplicates: true,
        });
      }
    });
  }
}

export { projectInclude };
