import type { NextFunction, Request, Response } from 'express';

import { toAppError } from '../common/errors/error-utils.js';
import type { Logger } from '../lib/logger.js';

export function createErrorHandler(logger: Logger) {
  return (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const appError = toAppError(error);

    if (!appError.isOperational || appError.statusCode >= 500) {
      logger.error(
        {
          err: error,
          requestId: req.requestId,
          path: req.path,
          method: req.method,
        },
        appError.message,
      );
    } else {
      logger.warn(
        {
          requestId: req.requestId,
          code: appError.code,
          path: req.path,
          method: req.method,
        },
        appError.message,
      );
    }

    const statusCode = appError.statusCode;
    const message =
      appError.isOperational || process.env.NODE_ENV !== 'production'
        ? appError.message
        : 'Internal server error';

    res.status(statusCode).json({
      error: {
        code: appError.code,
        message,
        ...(appError.details && appError.details.length > 0 ? { details: appError.details } : {}),
        requestId: req.requestId,
      },
    });
  };
}

export function fallbackErrorHandler(logger: Logger) {
  return (error: unknown): void => {
    logger.fatal({ err: error }, 'Unhandled application error');
    process.exit(1);
  };
}
