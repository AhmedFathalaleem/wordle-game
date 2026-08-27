import type { PrismaClient } from '@prisma/client';
import type { Router } from 'express';

import { asyncHandler } from '../../common/http/async-handler.js';
import {
  createCrudController,
  mountAdminCrudRoutes,
} from '../../common/http/crud.controller.js';
import { sendSuccess } from '../../common/http/response.js';
import type { AppConfig } from '../../config/index.js';
import { createAuthRateLimitMiddleware } from '../../middleware/auth-rate-limit.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { MessagesRepository } from './messages.repository.js';
import {
  createMessageSchema,
  messageListQuerySchema,
  updateMessageSchema,
} from './messages.schema.js';
import { MessagesService } from './messages.service.js';

export function createMessagesModule(prisma: PrismaClient, appConfig: AppConfig) {
  const repository = new MessagesRepository(prisma);
  const service = new MessagesService(repository);
  const authRateLimit = createAuthRateLimitMiddleware(appConfig);

  const adminController = createCrudController({
    list: (query, context) => service.list(query as never, context),
    getById: (id, context) => service.getById(id, context),
    create: (body, _actorId) =>
      service.create(body as never, {
        ipAddress: undefined,
        userAgent: undefined,
      }),
    update: (id, body) => service.update(id, body as never),
    remove: (id) => service.remove(id),
  });

  return {
    service,
    mountPublicRoutes: (router: Router) => {
      router.post(
        '/',
        authRateLimit,
        validate({ body: createMessageSchema }),
        asyncHandler(async (req, res) => {
          const message = await service.create(req.body, {
            ipAddress: req.ip,
            userAgent: req.header('user-agent') ?? undefined,
          });
          sendSuccess(res, message, { requestId: req.requestId }, 201);
        }),
      );
    },
    mountAdminRoutes: (router: Router) => {
      mountAdminCrudRoutes(router, appConfig, adminController, {
        list: messageListQuerySchema,
        create: createMessageSchema,
        update: updateMessageSchema,
      });
    },
  };
}

export type MessagesModule = ReturnType<typeof createMessagesModule>;
