import { z } from 'zod';

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true' || value === '1';
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 3001)),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) => parseOrigins(value)),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  API_VERSION: z.string().default('v1'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 60_000)),
  RATE_LIMIT_MAX: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 100)),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((value) => parseBoolean(value, false)),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 7)),
  AUTH_RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 900_000)),
  AUTH_RATE_LIMIT_MAX: z
    .string()
    .optional()
    .transform((value) => parsePort(value, 5)),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => parseBoolean(value, false)),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(input: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return result.data;
}
