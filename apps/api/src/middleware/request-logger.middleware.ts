import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { RequestHandler } from 'express';
import { pinoHttp } from 'pino-http';

import type { Logger } from '../lib/logger.js';

type RequestWithId = IncomingMessage & { requestId?: string };

export function createRequestLogger(logger: Logger): RequestHandler {
  return pinoHttp({
    logger,
    genReqId: (req: IncomingMessage) => {
      const requestWithId = req as RequestWithId;
      return requestWithId.requestId ?? randomUUID();
    },
    customProps: (req: IncomingMessage) => ({
      requestId: (req as IncomingMessage & { requestId?: string }).requestId,
    }),
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req: IncomingMessage, res: ServerResponse, error: Error) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
    },
    serializers: {
      req: (req: IncomingMessage) => ({
        method: req.method,
        url: req.url,
      }),
      res: (res: ServerResponse) => ({
        statusCode: res.statusCode,
      }),
    },
  });
}
