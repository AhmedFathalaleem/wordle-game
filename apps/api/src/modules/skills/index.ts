import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import {
  createCrudController,
  createPublicReadController,
  mountAdminCrudRoutes,
  mountPublicReadRoutes,
} from '../../common/http/crud.controller.js';
import type { AppConfig } from '../../config/index.js';
import { SkillsRepository } from './skills.repository.js';
import {
  createSkillSchema,
  skillListQuerySchema,
  updateSkillSchema,
} from './skills.schema.js';
import { SkillsService } from './skills.service.js';

export function createSkillsModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new SkillsRepository(prisma);
  const service = new SkillsService(repository);

  const adminController = createCrudController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
    create: (_body, _actorId) => service.create(_body as never),
    update: (id, body) => service.update(id, body as never),
    remove: (id) => service.remove(id),
  });

  const publicController = createPublicReadController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
  });

  return {
    service,
    mountPublicRoutes: (router: Router) => {
      mountPublicReadRoutes(router, publicController, skillListQuerySchema);
    },
    mountAdminRoutes: (router: Router) => {
      mountAdminCrudRoutes(router, appConfig, adminController, {
        list: skillListQuerySchema,
        create: createSkillSchema,
        update: updateSkillSchema,
      });
    },
  };
}

export type SkillsModule = ReturnType<typeof createSkillsModule>;
