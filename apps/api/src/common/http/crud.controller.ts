import { UserRole } from '@prisma/client';
import type { Request, Response, Router } from 'express';
import type { ZodTypeAny } from 'zod';

import { AppError } from '../errors/app-error.js';
import { asyncHandler } from './async-handler.js';
import { sendNoContent, sendSuccess } from './response.js';
import { idParamSchema } from '../schemas/common.schemas.js';
import type { AppConfig } from '../../config/index.js';
import { authorize, createAuthenticateMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';

const READ_ROLES = [UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.VIEWER] as const;
const WRITE_ROLES = [UserRole.SUPER_ADMIN, UserRole.EDITOR] as const;

function getRouteId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw AppError.badRequest('Invalid resource id');
  }

  return id;
}

export type CrudControllerHandlers = {
  list: (query: unknown, context: ListContext) => Promise<PaginatedResult<unknown>>;
  getById: (id: string, context: ListContext) => Promise<unknown>;
  create: (body: unknown, actorId: string) => Promise<unknown>;
  update: (id: string, body: unknown, actorId: string) => Promise<unknown>;
  remove: (id: string, actorId: string) => Promise<void>;
};

export type PublicReadControllerHandlers = {
  list: (query: unknown, context: ListContext) => Promise<PaginatedResult<unknown>>;
  getById: (id: string, context: ListContext) => Promise<unknown>;
};

export function createCrudController(handlers: CrudControllerHandlers) {
  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const result = await handlers.list(req.query, { actorId: req.user?.id });
      sendSuccess(res, result.items, {
        requestId: req.requestId,
        pagination: result.pagination,
      });
    }),
    getById: asyncHandler(async (req: Request, res: Response) => {
      const item = await handlers.getById(getRouteId(req), { actorId: req.user?.id });
      sendSuccess(res, item, { requestId: req.requestId });
    }),
    create: asyncHandler(async (req: Request, res: Response) => {
      const item = await handlers.create(req.body, req.user!.id);
      sendSuccess(res, item, { requestId: req.requestId }, 201);
    }),
    update: asyncHandler(async (req: Request, res: Response) => {
      const item = await handlers.update(getRouteId(req), req.body, req.user!.id);
      sendSuccess(res, item, { requestId: req.requestId });
    }),
    remove: asyncHandler(async (req: Request, res: Response) => {
      await handlers.remove(getRouteId(req), req.user!.id);
      sendNoContent(res);
    }),
  };
}

export function createPublicReadController(handlers: PublicReadControllerHandlers) {
  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const result = await handlers.list(req.query, { publicOnly: true });
      sendSuccess(res, result.items, {
        requestId: req.requestId,
        pagination: result.pagination,
      });
    }),
    getById: asyncHandler(async (req: Request, res: Response) => {
      const item = await handlers.getById(getRouteId(req), { publicOnly: true });
      sendSuccess(res, item, { requestId: req.requestId });
    }),
  };
}

type RouteSchemas = {
  list: ZodTypeAny;
  create: ZodTypeAny;
  update: ZodTypeAny;
};

export function mountAdminCrudRoutes(
  router: Router,
  appConfig: AppConfig,
  controller: ReturnType<typeof createCrudController>,
  schemas: RouteSchemas,
): void {
  const authenticate = createAuthenticateMiddleware(appConfig);

  router.get(
    '/',
    authenticate,
    authorize(...READ_ROLES),
    validate({ query: schemas.list }),
    controller.list,
  );
  router.post(
    '/',
    authenticate,
    authorize(...WRITE_ROLES),
    validate({ body: schemas.create }),
    controller.create,
  );
  router.get(
    '/:id',
    authenticate,
    authorize(...READ_ROLES),
    validate({ params: idParamSchema }),
    controller.getById,
  );
  router.patch(
    '/:id',
    authenticate,
    authorize(...WRITE_ROLES),
    validate({ params: idParamSchema, body: schemas.update }),
    controller.update,
  );
  router.delete(
    '/:id',
    authenticate,
    authorize(...WRITE_ROLES),
    validate({ params: idParamSchema }),
    controller.remove,
  );
}

export function mountPublicReadRoutes(
  router: Router,
  controller: ReturnType<typeof createPublicReadController>,
  listSchema: ZodTypeAny,
): void {
  router.get('/', validate({ query: listSchema }), controller.list);
  router.get('/:id', validate({ params: idParamSchema }), controller.getById);
}
