import { BaseResourceService } from '../../common/services/base-resource.service.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import type { CertificationsRepository } from './certifications.repository.js';
import type {
  CertificationListQuery,
  CreateCertificationInput,
  UpdateCertificationInput,
} from './certifications.schema.js';
import type { Certification } from '@prisma/client';

export class CertificationsService extends BaseResourceService<Certification, CertificationListQuery> {
  protected readonly resourceLabel = 'Certification';
  protected readonly defaultSort = '-issueDate';
  protected readonly sortableFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    issueDate: 'issueDate',
    expiryDate: 'expiryDate',
    name: 'name',
    sortOrder: 'sortOrder',
  };
  protected readonly searchableFields = ['name', 'issuer', 'credentialId'];

  constructor(private readonly certificationsRepository: CertificationsRepository) {
    super();
  }

  list(query: CertificationListQuery, context: ListContext = {}): Promise<PaginatedResult<unknown>> {
    void context;
    return this.listRecords(query, context, {
      buildWhere: (listQuery) => this.buildWhere(listQuery),
      findMany: (args) => this.certificationsRepository.findMany(args),
      mapRecord: (record) => this.mapCertification(record as Certification),
    });
  }

  async getById(id: string, context: ListContext = {}): Promise<unknown> {
    void context;
    return this.mapCertification(this.ensureFound(await this.certificationsRepository.findById(id)));
  }

  async create(input: CreateCertificationInput): Promise<unknown> {
    const certification = await this.certificationsRepository.create({
      name: input.name,
      issuer: input.issuer,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
    });

    return this.mapCertification(certification);
  }

  async update(id: string, input: UpdateCertificationInput): Promise<unknown> {
    this.ensureFound(await this.certificationsRepository.findById(id));

    const certification = await this.certificationsRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.issuer !== undefined ? { issuer: input.issuer } : {}),
      ...(input.issueDate !== undefined ? { issueDate: input.issueDate } : {}),
      ...(input.expiryDate !== undefined ? { expiryDate: input.expiryDate } : {}),
      ...(input.credentialId !== undefined ? { credentialId: input.credentialId } : {}),
      ...(input.credentialUrl !== undefined ? { credentialUrl: input.credentialUrl } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    return this.mapCertification(certification);
  }

  async remove(id: string): Promise<void> {
    this.ensureFound(await this.certificationsRepository.findById(id));
    await this.certificationsRepository.delete(id);
  }

  private buildWhere(query: CertificationListQuery): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.issuer) {
      where.issuer = { contains: query.issuer, mode: 'insensitive' };
    }

    return where;
  }

  private mapCertification(certification: Certification) {
    return {
      id: certification.id,
      name: certification.name,
      issuer: certification.issuer,
      issueDate: certification.issueDate,
      expiryDate: certification.expiryDate,
      credentialId: certification.credentialId,
      credentialUrl: certification.credentialUrl,
      sortOrder: certification.sortOrder,
      createdAt: certification.createdAt,
      updatedAt: certification.updatedAt,
    };
  }
}
