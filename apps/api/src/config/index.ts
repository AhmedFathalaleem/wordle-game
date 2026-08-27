import 'dotenv/config';

import { loadEnv } from './env.schema.js';

const env = loadEnv(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  corsOrigins: env.CORS_ORIGINS,
  logLevel: env.LOG_LEVEL,
  databaseUrl: env.DATABASE_URL,
  apiVersion: env.API_VERSION,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  trustProxy: env.TRUST_PROXY,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresDays: env.JWT_REFRESH_EXPIRES_DAYS,
  },
  authRateLimit: {
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
  },
  cookies: {
    secure: env.NODE_ENV === 'production' ? true : env.COOKIE_SECURE,
    authPath: `/api/${env.API_VERSION}/auth`,
  },
} as const;

export type AppConfig = typeof config;
