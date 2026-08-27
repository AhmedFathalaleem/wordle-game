import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import {
  createCrudController,
  createPublicReadController,
  mountAdminCrudRoutes,
  mountPublicReadRoutes,
} from '../../common/http/crud.controller.js';
import type { AppConfig } from '../../config/index.js';
import { SocialLinksRepository } from './social-links.repository.js';
import {
  createSocialLinkSchema,
  socialLinkListQuerySchema,
  updateSocialLinkSchema,
} from './social-links.schema.js';
import { SocialLinksService } from './social-links.service.js';

export function createSocialLinksModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new SocialLinksRepository(prisma);
  const service = new SocialLinksService(repository);

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
      mountPublicReadRoutes(router, publicController, socialLinkListQuerySchema);
    },
    mountAdminRoutes: (router: Router) => {
      mountAdminCrudRoutes(router, appConfig, adminController, {
        list: socialLinkListQuerySchema,
        create: createSocialLinkSchema,
        update: updateSocialLinkSchema,
      });
    },
  };
}

export type SocialLinksModule = ReturnType<typeof createSocialLinksModule>;
