import { AppError } from '../errors/app-error.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import { paginate } from '../utils/pagination.util.js';
import { buildSearchFilter, parseSortParam } from '../utils/query.util.js';

export abstract class BaseResourceService<TRecord extends { id: string }, TListQuery> {
  protected abstract readonly resourceLabel: string;
  protected abstract readonly defaultSort: string;
  protected abstract readonly sortableFields: Record<string, string>;
  protected abstract readonly searchableFields: string[];

  protected ensureFound<T>(entity: T | null, message?: string): T {
    if (!entity) {
      throw AppError.notFound(message ?? `${this.resourceLabel} not found`);
    }

    return entity;
  }

  protected async listRecords(
    query: TListQuery & { cursor?: string; limit: number; search?: string; sort?: string },
    context: ListContext,
    options: {
      buildWhere: (query: TListQuery, context: ListContext) => Record<string, unknown>;
      findMany: (args: {
        where: Record<string, unknown>;
        orderBy: Array<Record<string, 'asc' | 'desc'>>;
        take: number;
        cursor?: { id: string };
        skip?: number;
      }) => Promise<TRecord[]>;
      mapRecord: (record: TRecord) => unknown;
    },
  ): Promise<PaginatedResult<unknown>> {
    const baseWhere = options.buildWhere(query, context);
    const searchFilter = buildSearchFilter(query.search, this.searchableFields);
    const where = searchFilter ? { AND: [baseWhere, searchFilter] } : baseWhere;

    const orderBy = parseSortParam(query.sort, this.sortableFields, this.defaultSort);

    const page = await paginate({
      limit: query.limit,
      cursor: query.cursor,
      findMany: ({ take, cursor, skip }) =>
        options.findMany({
          where,
          orderBy,
          take,
          cursor,
          skip,
        }),
    });

    return {
      items: page.items.map(options.mapRecord),
      pagination: {
        cursor: page.nextCursor,
        hasMore: page.hasMore,
        limit: query.limit,
      },
    };
  }
}
