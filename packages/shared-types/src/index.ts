export type ApiResponse<T> = {
  data: T;
  meta?: {
    requestId?: string;
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
};

export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'VIEWER';
