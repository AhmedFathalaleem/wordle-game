import { UserRole } from '@prisma/client';
import { Router } from 'express';

import type { AppConfig } from '../../config/index.js';
import { authorize, createAuthenticateMiddleware } from '../../middleware/auth.middleware.js';
import { AdminController } from './admin.controller.js';

export function createAdminRouter(appConfig: AppConfig): Router {
  const router = Router();
  const authenticate = createAuthenticateMiddleware(appConfig);
  const controller = new AdminController();

  router.get(
    '/dashboard',
    authenticate,
    authorize(UserRole.SUPER_ADMIN, UserRole.EDITOR),
    controller.dashboard,
  );

  return router;
}

export function createAdminModule(appConfig: AppConfig) {
  const router = createAdminRouter(appConfig);

  return { router };
}

export type AdminModule = ReturnType<typeof createAdminModule>;
