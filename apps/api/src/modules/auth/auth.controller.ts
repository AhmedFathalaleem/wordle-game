import type { Request, Response } from 'express';

import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/http/async-handler.js';
import { sendNoContent, sendSuccess } from '../../common/http/response.js';
import type { AppConfig } from '../../config/index.js';
import { clearAuthCookies, getRefreshTokenFromRequest, setAuthCookies } from '../../lib/cookies.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfig: AppConfig,
  ) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body, this.getRequestMetadata(req));

    setAuthCookies(res, result.refreshToken, result.csrfToken, this.appConfig);

    sendSuccess(
      res,
      {
        accessToken: result.accessToken,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
        csrfToken: result.csrfToken,
        user: result.user,
      },
      { requestId: req.requestId },
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req.cookies);

    if (!refreshToken) {
      throw AppError.unauthorized('Refresh token is required');
    }

    const result = await this.authService.refresh(refreshToken, this.getRequestMetadata(req));

    setAuthCookies(res, result.refreshToken, result.csrfToken, this.appConfig);

    sendSuccess(
      res,
      {
        accessToken: result.accessToken,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
        csrfToken: result.csrfToken,
      },
      { requestId: req.requestId },
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req.cookies);
    await this.authService.logout(refreshToken);
    clearAuthCookies(res, this.appConfig);
    sendNoContent(res);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getCurrentUser(req.user!.id);
    sendSuccess(res, user, { requestId: req.requestId });
  });

  private getRequestMetadata(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.header('user-agent') ?? undefined,
    };
  }
}
