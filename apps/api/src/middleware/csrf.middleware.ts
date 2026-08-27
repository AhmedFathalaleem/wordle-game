import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../common/errors/app-error.js';
import { getCsrfTokenFromRequest } from '../lib/cookies.js';
import { safeEqualStrings } from '../lib/tokens.js';

const CSRF_HEADER = 'x-csrf-token';

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  const csrfCookie = getCsrfTokenFromRequest(req.cookies);
  const csrfHeader = req.header(CSRF_HEADER);

  if (!csrfCookie || !csrfHeader || !safeEqualStrings(csrfCookie, csrfHeader)) {
    next(AppError.forbidden('Invalid CSRF token'));
    return;
  }

  next();
}
