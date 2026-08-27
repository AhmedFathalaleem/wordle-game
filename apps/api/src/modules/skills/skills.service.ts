import { ProficiencyLevel } from '@prisma/client';

import { AppError } from '../../common/errors/app-error.js';
import { BaseResourceService } from '../../common/services/base-resource.service.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import type { SkillsRepository, SkillWithRelations } from './skills.repository.js';
import type { CreateSkillInput, SkillListQuery, UpdateSkillInput } from './skills.schema.js';
import { skillInclude } from './skills.repository.js';

export class SkillsService extends BaseResourceService<SkillWithRelations, SkillListQuery> {
  protected readonly resourceLabel = 'Skill';
  protected readonly defaultSort = 'sortOrder';
  protected readonly sortableFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    sortOrder: 'sortOrder',
    proficiencyLevel: 'proficiencyLevel',
  };
  protected readonly searchableFields = ['name'];

  constructor(private readonly skillsRepository: SkillsRepository) {
    super();
  }

  list(query: SkillListQuery, context: ListContext = {}): Promise<PaginatedResult<unknown>> {
    void context;
    return this.listRecords(query, context, {
      buildWhere: (listQuery) => this.buildWhere(listQuery),
      findMany: async (args) => {
        const records = await this.skillsRepository.findMany({
          ...args,
          include: skillInclude,
        });

        return records as SkillWithRelations[];
      },
      mapRecord: (record) => this.mapSkill(record as SkillWithRelations),
    });
  }

  async getById(id: string, context: ListContext = {}): Promise<unknown> {
    void context;
    return this.mapSkill(this.ensureFound(await this.skillsRepository.findById(id)));
  }

  async create(input: CreateSkillInput): Promise<unknown> {
    await this.ensureCategoryExists(input.skillCategoryId);

    const skill = await this.skillsRepository.create({
      name: input.name,
      skillCategory: { connect: { id: input.skillCategoryId } },
      proficiencyLevel: input.proficiencyLevel ?? ProficiencyLevel.INTERMEDIATE,
      sortOrder: input.sortOrder ?? 0,
    });

    return this.mapSkill(skill);
  }

  async update(id: string, input: UpdateSkillInput): Promise<unknown> {
    this.ensureFound(await this.skillsRepository.findById(id));

    if (input.skillCategoryId) {
      await this.ensureCategoryExists(input.skillCategoryId);
    }

    const skill = await this.skillsRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.skillCategoryId !== undefined
        ? { skillCategory: { connect: { id: input.skillCategoryId } } }
        : {}),
      ...(input.proficiencyLevel !== undefined ? { proficiencyLevel: input.proficiencyLevel } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    return this.mapSkill(skill);
  }

  async remove(id: string): Promise<void> {
    this.ensureFound(await this.skillsRepository.findById(id));
    await this.skillsRepository.delete(id);
  }

  private buildWhere(query: SkillListQuery): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.skillCategoryId) {
      where.skillCategoryId = query.skillCategoryId;
    }

    if (query.proficiencyLevel) {
      where.proficiencyLevel = query.proficiencyLevel;
    }

    return where;
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const exists = await this.skillsRepository.categoryExists(categoryId);

    if (!exists) {
      throw AppError.notFound('Skill category not found');
    }
  }

  private mapSkill(skill: SkillWithRelations) {
    return {
      id: skill.id,
      name: skill.name,
      skillCategoryId: skill.skillCategoryId,
      skillCategory: skill.skillCategory,
      proficiencyLevel: skill.proficiencyLevel,
      sortOrder: skill.sortOrder,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    };
  }
}
