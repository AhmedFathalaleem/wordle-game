import express, { type Express } from 'express';

import { registerErrorHandlers, registerMiddleware } from './middleware/index.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { createV1Router } from './routes/v1.routes.js';
import type { AppDependencies } from './types/app.types.js';

export function createApp(dependencies: AppDependencies): Express {
  const app = express();

  registerMiddleware(app, dependencies);

  const apiBasePath = `/api/${dependencies.config.apiVersion}`;
  app.use(apiBasePath, createV1Router(dependencies));

  app.use(notFoundHandler);
  registerErrorHandlers(app, dependencies);

  return app;
}
