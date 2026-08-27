import type { Request, Response } from 'express';

import { asyncHandler } from '../../common/http/async-handler.js';
import { sendSuccess } from '../../common/http/response.js';

export class AdminController {
  dashboard = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        message: 'Admin access granted',
        role: req.user!.role,
      },
      { requestId: req.requestId },
    );
  });
}
