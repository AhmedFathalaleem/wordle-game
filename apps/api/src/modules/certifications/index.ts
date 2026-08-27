import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import {
  createCrudController,
  createPublicReadController,
  mountAdminCrudRoutes,
  mountPublicReadRoutes,
} from '../../common/http/crud.controller.js';
import type { AppConfig } from '../../config/index.js';
import { CertificationsRepository } from './certifications.repository.js';
import {
  certificationListQuerySchema,
  createCertificationSchema,
  updateCertificationSchema,
} from './certifications.schema.js';
import { CertificationsService } from './certifications.service.js';

export function createCertificationsModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new CertificationsRepository(prisma);
  const service = new CertificationsService(repository);

  const adminController = createCrudController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
    create: (_body) => service.create(_body as never),
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
      mountPublicReadRoutes(router, publicController, certificationListQuerySchema);
    },
    mountAdminRoutes: (router: Router) => {
      mountAdminCrudRoutes(router, appConfig, adminController, {
        list: certificationListQuerySchema,
        create: createCertificationSchema,
        update: updateCertificationSchema,
      });
    },
  };
}

export type CertificationsModule = ReturnType<typeof createCertificationsModule>;
