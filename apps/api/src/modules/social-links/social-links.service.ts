import type { SocialLink } from '@prisma/client';

import { AppError } from '../../common/errors/app-error.js';
import { BaseResourceService } from '../../common/services/base-resource.service.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import type { SocialLinksRepository } from './social-links.repository.js';
import type {
  CreateSocialLinkInput,
  SocialLinkListQuery,
  UpdateSocialLinkInput,
} from './social-links.schema.js';

export class SocialLinksService extends BaseResourceService<SocialLink, SocialLinkListQuery> {
  protected readonly resourceLabel = 'Social link';
  protected readonly defaultSort = 'sortOrder';
  protected readonly sortableFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    sortOrder: 'sortOrder',
    platform: 'platform',
  };
  protected readonly searchableFields = ['label', 'url'];

  constructor(private readonly socialLinksRepository: SocialLinksRepository) {
    super();
  }

  list(query: SocialLinkListQuery, context: ListContext = {}): Promise<PaginatedResult<unknown>> {
    return this.listRecords(query, context, {
      buildWhere: (listQuery, listContext) => this.buildWhere(listQuery, listContext),
      findMany: (args) => this.socialLinksRepository.findMany(args),
      mapRecord: (record) => this.mapSocialLink(record as SocialLink),
    });
  }

  async getById(id: string, context: ListContext = {}): Promise<unknown> {
    const link = this.ensureFound(await this.socialLinksRepository.findById(id));

    if (context.publicOnly && !link.isActive) {
      throw AppError.notFound('Social link not found');
    }

    return this.mapSocialLink(link);
  }

  async create(input: CreateSocialLinkInput): Promise<unknown> {
    const link = await this.socialLinksRepository.create({
      platform: input.platform,
      url: input.url,
      label: input.label,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });

    return this.mapSocialLink(link);
  }

  async update(id: string, input: UpdateSocialLinkInput): Promise<unknown> {
    this.ensureFound(await this.socialLinksRepository.findById(id));

    const link = await this.socialLinksRepository.update(id, {
      ...(input.platform !== undefined ? { platform: input.platform } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    return this.mapSocialLink(link);
  }

  async remove(id: string): Promise<void> {
    this.ensureFound(await this.socialLinksRepository.findById(id));
    await this.socialLinksRepository.delete(id);
  }

  private buildWhere(query: SocialLinkListQuery, context: ListContext): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (context.publicOnly) {
      where.isActive = true;
    } else if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.platform) {
      where.platform = query.platform;
    }

    return where;
  }

  private mapSocialLink(link: SocialLink) {
    return {
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label,
      sortOrder: link.sortOrder,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }
}
