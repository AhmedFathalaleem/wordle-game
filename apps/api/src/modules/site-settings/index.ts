import { UserRole } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import { asyncHandler } from '../../common/http/async-handler.js';
import { sendSuccess } from '../../common/http/response.js';
import type { AppConfig } from '../../config/index.js';
import { createAuthenticateMiddleware, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { SiteSettingsRepository } from './site-settings.repository.js';
import {
  createSiteSettingsSchema,
  updateSiteSettingsSchema,
} from './site-settings.schema.js';
import { SiteSettingsService } from './site-settings.service.js';

const READ_ROLES = [UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.VIEWER] as const;
const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.EDITOR] as const;

export function createSiteSettingsModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new SiteSettingsRepository(prisma);
  const service = new SiteSettingsService(repository);
  const authenticate = createAuthenticateMiddleware(appConfig);

  return {
    service,
    mountPublicRoutes: (router: Router) => {
      router.get(
        '/',
        asyncHandler(async (req, res) => {
          const settings = await service.getPublicSettings();
          sendSuccess(res, settings, { requestId: req.requestId });
        }),
      );
    },
    mountAdminRoutes: (router: Router) => {
      router.get(
        '/',
        authenticate,
        authorize(...READ_ROLES),
        asyncHandler(async (req, res) => {
          const settings = await service.getAdminSettings();
          sendSuccess(res, settings, { requestId: req.requestId });
        }),
      );

      router.post(
        '/',
        authenticate,
        authorize(...WRITE_ROLES),
        validate({ body: createSiteSettingsSchema }),
        asyncHandler(async (req, res) => {
          const settings = await service.create(req.body, req.user!.id);
          sendSuccess(res, settings, { requestId: req.requestId }, 201);
        }),
      );

      router.patch(
        '/',
        authenticate,
        authorize(...WRITE_ROLES),
        validate({ body: updateSiteSettingsSchema }),
        asyncHandler(async (req, res) => {
          const settings = await service.update(req.body, req.user!.id);
          sendSuccess(res, settings, { requestId: req.requestId });
        }),
      );
    },
  };
}

export type SiteSettingsModule = ReturnType<typeof createSiteSettingsModule>;
