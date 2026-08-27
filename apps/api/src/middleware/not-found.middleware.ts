import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../common/errors/app-error.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound('Route not found'));
}
