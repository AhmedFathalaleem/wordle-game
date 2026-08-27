import type { AppConfig } from '../config/index.js';
import { config } from '../config/index.js';
import pino from 'pino';

export function createLogger(appConfig: AppConfig = config) {
  return pino({
    level: appConfig.logLevel,
    ...(appConfig.isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  });
}

export const logger = createLogger();

export type Logger = typeof logger;
