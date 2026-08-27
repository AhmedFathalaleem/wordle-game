import { AppError } from '../errors/app-error.js';
import type { CursorPayload } from '../../types/pagination.types.js';

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as CursorPayload;

    if (!parsed?.id || typeof parsed.id !== 'string') {
      throw AppError.badRequest('Invalid pagination cursor');
    }

    return parsed;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.badRequest('Invalid pagination cursor');
  }
}

export async function paginate<T extends { id: string }>(options: {
  limit: number;
  cursor?: string;
  findMany: (args: { take: number; cursor?: { id: string }; skip?: number }) => Promise<T[]>;
}): Promise<{ items: T[]; nextCursor?: string; hasMore: boolean }> {
  const take = options.limit + 1;
  const cursorPayload = options.cursor ? decodeCursor(options.cursor) : undefined;

  const records = await options.findMany({
    take,
    ...(cursorPayload
      ? {
          cursor: { id: cursorPayload.id },
          skip: 1,
        }
      : {}),
  });

  const hasMore = records.length > options.limit;
  const items = hasMore ? records.slice(0, options.limit) : records;
  const lastItem = items.at(-1);

  return {
    items,
    hasMore,
    nextCursor: hasMore && lastItem ? encodeCursor({ id: lastItem.id }) : undefined,
  };
}
