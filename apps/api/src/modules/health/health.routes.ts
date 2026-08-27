import { Router } from 'express';

import { validate } from '../../middleware/validate.middleware.js';
import type { HealthController } from './health.controller.js';
import { healthCheckParamsSchema } from './health.schema.js';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();

  router.get('/', validate({ query: healthCheckParamsSchema }), controller.liveness);
  router.get('/ready', validate({ query: healthCheckParamsSchema }), controller.readiness);

  return router;
}
