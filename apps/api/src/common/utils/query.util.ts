import type { Prisma } from '@prisma/client';

const SORT_DIRECTION_PATTERN = /^(-?)([a-zA-Z0-9_]+)$/;

export function parseSortParam(
  sort: string | undefined,
  allowedFields: Record<string, string>,
  defaultSort: string,
): Array<Record<string, Prisma.SortOrder>> {
  const sortValue = sort && sort.trim().length > 0 ? sort : defaultSort;
  const parts = sortValue.split(',').map((part) => part.trim()).filter(Boolean);

  const orderBy: Array<Record<string, Prisma.SortOrder>> = [];

  for (const part of parts) {
    const match = SORT_DIRECTION_PATTERN.exec(part);

    if (!match) {
      continue;
    }

    const direction: Prisma.SortOrder = match[1] === '-' ? 'desc' : 'asc';
    const fieldKey = match[2];

    if (!fieldKey) {
      continue;
    }

    const prismaField = allowedFields[fieldKey];

    if (!prismaField) {
      continue;
    }

    orderBy.push({ [prismaField]: direction });
  }

  if (orderBy.length === 0) {
    const [field, direction] = defaultSort.startsWith('-')
      ? [defaultSort.slice(1), 'desc' as const]
      : [defaultSort, 'asc' as const];

    const prismaField = allowedFields[field];

    if (prismaField) {
      orderBy.push({ [prismaField]: direction });
    }
  }

  return orderBy;
}

export function buildSearchFilter(
  search: string | undefined,
  fields: string[],
): { OR: Array<Record<string, { contains: string; mode: 'insensitive' }>> } | undefined {
  if (!search || search.trim().length === 0) {
    return undefined;
  }

  const term = search.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: term,
        mode: 'insensitive' as const,
      },
    })),
  };
}
