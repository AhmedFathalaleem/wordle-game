import type { Request, Response } from 'express';

import { asyncHandler } from '../../common/http/async-handler.js';
import { sendSuccess } from '../../common/http/response.js';
import type { HealthService } from './health.service.js';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  liveness = asyncHandler(async (req: Request, res: Response) => {
    const data = this.healthService.getLiveness();
    sendSuccess(res, data, { requestId: req.requestId });
  });

  readiness = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.healthService.getReadiness();
    const statusCode = data.status === 'ok' ? 200 : 503;
    sendSuccess(res, data, { requestId: req.requestId }, statusCode);
  });
}
