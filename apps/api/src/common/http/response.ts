import type { Response } from 'express';

type SuccessMeta = {
  requestId?: string;
  pagination?: {
    cursor?: string;
    hasMore?: boolean;
    limit?: number;
  };
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: SuccessMeta,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    data,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  });
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
