import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../common/errors/app-error.js';
import type { AppConfig } from '../config/index.js';
import { verifyAccessToken } from '../lib/jwt.js';

export function createAuthenticateMiddleware(appConfig: AppConfig) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authorization = req.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      next(AppError.unauthorized());
      return;
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      next(AppError.unauthorized());
      return;
    }

    try {
      const payload = verifyAccessToken(token, appConfig);
      req.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }

    next();
  };
}

export function optionalAuthenticate(appConfig: AppConfig) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authorization = req.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      next();
      return;
    }

    createAuthenticateMiddleware(appConfig)(req, _res, next);
  };
}
