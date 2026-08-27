import { ContentStatus, type Prisma } from '@prisma/client';

import { AppError } from '../../common/errors/app-error.js';
import { BaseResourceService } from '../../common/services/base-resource.service.js';
import { slugify } from '../../lib/slug.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import type { ProjectsRepository } from './projects.repository.js';
import { projectInclude, type ProjectWithRelations } from './projects.repository.js';
import type {
  CreateProjectInput,
  ProjectListQuery,
  UpdateProjectInput,
} from './projects.schema.js';

export class ProjectsService extends BaseResourceService<ProjectWithRelations, ProjectListQuery> {
  protected readonly resourceLabel = 'Project';
  protected readonly defaultSort = '-createdAt';
  protected readonly sortableFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    sortOrder: 'sortOrder',
    publishedAt: 'publishedAt',
    status: 'status',
  };
  protected readonly searchableFields = ['title', 'summary', 'slug'];

  constructor(private readonly projectsRepository: ProjectsRepository) {
    super();
  }

  list(query: ProjectListQuery, context: ListContext = {}): Promise<PaginatedResult<unknown>> {
    return this.listRecords(query, context, {
      buildWhere: (listQuery, listContext) => this.buildWhere(listQuery, listContext),
      findMany: async (args) => {
        const records = await this.projectsRepository.findMany({
          ...args,
          include: projectInclude,
        });

        return records as ProjectWithRelations[];
      },
      mapRecord: (record) => this.mapProject(record as ProjectWithRelations),
    });
  }

  async getById(id: string, context: ListContext = {}): Promise<unknown> {
    const project = this.ensureFound(
      await this.projectsRepository.findById(id, !context.publicOnly),
    );

    if (context.publicOnly && project.status !== ContentStatus.PUBLISHED) {
      throw AppError.notFound('Project not found');
    }

    return this.mapProject(project);
  }

  async create(input: CreateProjectInput, actorId: string): Promise<unknown> {
    const slug = input.slug ?? slugify(input.title);
    await this.ensureUniqueSlug(slug);

    const project = await this.projectsRepository.create({
      title: input.title,
      slug,
      summary: input.summary,
      content: input.content,
      category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
      status: input.status ?? ContentStatus.DRAFT,
      sortOrder: input.sortOrder ?? 0,
      featured: input.featured ?? false,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      seo: (input.seo ?? {}) as Prisma.InputJsonValue,
      publishedAt: input.publishedAt ?? null,
      scheduledAt: input.scheduledAt ?? null,
      createdBy: { connect: { id: actorId } },
      updatedBy: { connect: { id: actorId } },
    });

    if (input.technologyIds?.length) {
      await this.projectsRepository.setTechnologies(project.id, input.technologyIds);
      return this.getById(project.id, {});
    }

    return this.mapProject(project);
  }

  async update(id: string, input: UpdateProjectInput, actorId: string): Promise<unknown> {
    const existing = this.ensureFound(await this.projectsRepository.findById(id, true));

    if (input.slug && input.slug !== existing.slug) {
      await this.ensureUniqueSlug(input.slug, id);
    }

    const project = await this.projectsRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.categoryId !== undefined
        ? input.categoryId
          ? { category: { connect: { id: input.categoryId } } }
          : { category: { disconnect: true } }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      ...(input.seo !== undefined ? { seo: input.seo as Prisma.InputJsonValue } : {}),
      ...(input.publishedAt !== undefined ? { publishedAt: input.publishedAt } : {}),
      ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      updatedBy: { connect: { id: actorId } },
    });

    if (input.technologyIds !== undefined) {
      await this.projectsRepository.setTechnologies(id, input.technologyIds);
      return this.getById(id, {});
    }

    return this.mapProject(project);
  }

  async remove(id: string): Promise<void> {
    this.ensureFound(await this.projectsRepository.findById(id, true));
    await this.projectsRepository.softDelete(id);
  }

  private buildWhere(query: ProjectListQuery, context: ListContext): Record<string, unknown> {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (context.publicOnly) {
      where.status = ContentStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    return where;
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.projectsRepository.findBySlug(slug);

    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Project slug already exists');
    }
  }

  private mapProject(project: ProjectWithRelations) {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      content: project.content,
      categoryId: project.categoryId,
      category: project.category,
      status: project.status,
      sortOrder: project.sortOrder,
      featured: project.featured,
      metadata: project.metadata,
      seo: project.seo,
      publishedAt: project.publishedAt,
      scheduledAt: project.scheduledAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      images: project.images,
      technologies: project.technologies.map((entry) => entry.technology),
      createdById: project.createdById,
      updatedById: project.updatedById,
    };
  }
}
