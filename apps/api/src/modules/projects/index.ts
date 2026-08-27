import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import {
  createCrudController,
  createPublicReadController,
  mountAdminCrudRoutes,
  mountPublicReadRoutes,
} from '../../common/http/crud.controller.js';
import type { AppConfig } from '../../config/index.js';
import { ProjectsRepository } from './projects.repository.js';
import {
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
} from './projects.schema.js';
import { ProjectsService } from './projects.service.js';

export function createProjectsModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new ProjectsRepository(prisma);
  const service = new ProjectsService(repository);

  const adminController = createCrudController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
    create: (body, actorId) => service.create(body as never, actorId),
    update: (id, body, actorId) => service.update(id, body as never, actorId),
    remove: (id) => service.remove(id),
  });

  const publicController = createPublicReadController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
  });

  return {
    service,
    mountPublicRoutes: (router: Router) => {
      mountPublicReadRoutes(router, publicController, projectListQuerySchema);
    },
    mountAdminRoutes: (router: Router) => {
      mountAdminCrudRoutes(router, appConfig, adminController, {
        list: projectListQuerySchema,
        create: createProjectSchema,
        update: updateProjectSchema,
      });
    },
  };
}

export type ProjectsModule = ReturnType<typeof createProjectsModule>;
