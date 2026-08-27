import { Router } from 'express';

import type { AppConfig } from '../../config/index.js';
import { createAuthenticateMiddleware } from '../../middleware/auth.middleware.js';
import { createAuthRateLimitMiddleware } from '../../middleware/auth-rate-limit.middleware.js';
import { csrfProtection } from '../../middleware/csrf.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import type { AuthController } from './auth.controller.js';
import { loginBodySchema, logoutBodySchema, refreshBodySchema } from './auth.schema.js';

export function createAuthRouter(controller: AuthController, appConfig: AppConfig): Router {
  const router = Router();
  const authenticate = createAuthenticateMiddleware(appConfig);
  const authRateLimit = createAuthRateLimitMiddleware(appConfig);

  router.post('/login', authRateLimit, validate({ body: loginBodySchema }), controller.login);
  router.post(
    '/refresh',
    authRateLimit,
    csrfProtection,
    validate({ body: refreshBodySchema }),
    controller.refresh,
  );
  router.post(
    '/logout',
    csrfProtection,
    validate({ body: logoutBodySchema }),
    controller.logout,
  );
  router.get('/me', authenticate, controller.me);

  return router;
}
