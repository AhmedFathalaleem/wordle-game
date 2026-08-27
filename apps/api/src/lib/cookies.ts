import type { CookieOptions, Response } from 'express';

import { CSRF_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../common/constants/auth.constants.js';
import type { AppConfig } from '../config/index.js';

function getBaseCookieOptions(appConfig: AppConfig): Pick<CookieOptions, 'secure' | 'sameSite' | 'path'> {
  return {
    secure: appConfig.cookies.secure,
    sameSite: 'strict',
    path: appConfig.cookies.authPath,
  };
}

export function getRefreshCookieOptions(appConfig: AppConfig): CookieOptions {
  return {
    ...getBaseCookieOptions(appConfig),
    httpOnly: true,
    maxAge: appConfig.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000,
  };
}

export function getCsrfCookieOptions(appConfig: AppConfig): CookieOptions {
  return {
    ...getBaseCookieOptions(appConfig),
    httpOnly: false,
    maxAge: appConfig.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000,
  };
}

export function setAuthCookies(
  res: Response,
  refreshToken: string,
  csrfToken: string,
  appConfig: AppConfig,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions(appConfig));
  res.cookie(CSRF_TOKEN_COOKIE, csrfToken, getCsrfCookieOptions(appConfig));
}

export function clearAuthCookies(res: Response, appConfig: AppConfig): void {
  const baseOptions = getBaseCookieOptions(appConfig);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseOptions);
  res.clearCookie(CSRF_TOKEN_COOKIE, baseOptions);
}

export function getRefreshTokenFromRequest(
  cookies: Record<string, string | undefined>,
): string | undefined {
  const token = cookies[REFRESH_TOKEN_COOKIE];
  return token && token.length > 0 ? token : undefined;
}

export function getCsrfTokenFromRequest(
  cookies: Record<string, string | undefined>,
): string | undefined {
  const token = cookies[CSRF_TOKEN_COOKIE];
  return token && token.length > 0 ? token : undefined;
}
