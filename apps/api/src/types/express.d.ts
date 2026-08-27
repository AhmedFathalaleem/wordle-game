import type { UserRole } from '@prisma/client';
import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
      };
    }
  }
}

export type TypedRequest<
  TParams = Record<string, string>,
  TResBody = unknown,
  TReqBody = unknown,
  TQuery = Record<string, string | string[] | undefined>,
> = Request<TParams, TResBody, TReqBody, TQuery>;

export {};
