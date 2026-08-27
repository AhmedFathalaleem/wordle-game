import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import type { AppDependencies } from '../types/app.types.js';
import { createErrorHandler } from './error-handler.middleware.js';
import { createRateLimitMiddleware } from './rate-limit.middleware.js';
import { createRequestLogger } from './request-logger.middleware.js';
import { requestIdMiddleware } from './request-id.middleware.js';

export function registerMiddleware(app: Express, dependencies: AppDependencies): void {
  const { config, logger } = dependencies;

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy ? 1 : false);

  app.use(requestIdMiddleware);
  app.use(createRequestLogger(logger));
  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(createRateLimitMiddleware(config));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
}

export function registerErrorHandlers(app: Express, dependencies: AppDependencies): void {
  app.use(createErrorHandler(dependencies.logger));
}
