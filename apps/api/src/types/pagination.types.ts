export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    limit: number;
  };
};

export type ListContext = {
  publicOnly?: boolean;
  actorId?: string;
};

export type CursorPayload = {
  id: string;
};
