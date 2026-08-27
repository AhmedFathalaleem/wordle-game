import type { PrismaClient } from '@prisma/client';

import type { AppConfig } from '../config/index.js';
import type { Logger } from '../lib/logger.js';

export type AppDependencies = {
  config: AppConfig;
  logger: Logger;
  prisma: PrismaClient;
};

export type CreateAppOptions = {
  dependencies: AppDependencies;
};
