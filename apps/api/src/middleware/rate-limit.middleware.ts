import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

import type { AppConfig } from '../config/index.js';

export function createRateLimitMiddleware(appConfig: AppConfig): RequestHandler {
  return rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
  });
}
