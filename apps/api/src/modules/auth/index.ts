import type { PrismaClient } from '@prisma/client';

import type { AppConfig } from '../../config/index.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { createAuthRouter } from './auth.routes.js';
import { AuthService } from './auth.service.js';

export function createAuthModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new AuthRepository(prisma);
  const service = new AuthService(repository, appConfig);
  const controller = new AuthController(service, appConfig);
  const router = createAuthRouter(controller, appConfig);

  return {
    repository,
    service,
    controller,
    router,
  };
}

export type AuthModule = ReturnType<typeof createAuthModule>;
