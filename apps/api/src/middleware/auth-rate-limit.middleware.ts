import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

import type { AppConfig } from '../config/index.js';

export function createAuthRateLimitMiddleware(appConfig: AppConfig): RequestHandler {
  return rateLimit({
    windowMs: appConfig.authRateLimit.windowMs,
    max: appConfig.authRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
      },
    },
  });
}
