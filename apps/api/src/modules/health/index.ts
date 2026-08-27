import type { PrismaClient } from '@prisma/client';

import { HealthController } from './health.controller.js';
import { HealthRepository } from './health.repository.js';
import { createHealthRouter } from './health.routes.js';
import { HealthService } from './health.service.js';

export function createHealthModule(prisma: PrismaClient) {
  const repository = new HealthRepository(prisma);
  const service = new HealthService(repository);
  const controller = new HealthController(service);
  const router = createHealthRouter(controller);

  return {
    repository,
    service,
    controller,
    router,
  };
}

export type HealthModule = ReturnType<typeof createHealthModule>;
