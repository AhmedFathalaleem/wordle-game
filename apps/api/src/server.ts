import type { Server } from 'node:http';

import { createApp } from './app.js';
import { config } from './config/index.js';
import { fallbackErrorHandler } from './middleware/error-handler.middleware.js';
import { connectPrisma, disconnectPrisma, prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';
import type { AppDependencies } from './types/app.types.js';

const dependencies: AppDependencies = {
  config,
  logger,
  prisma,
};

const app = createApp(dependencies);
const errorHandler = fallbackErrorHandler(logger);

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

let server: Server;

async function bootstrap(): Promise<void> {
  await connectPrisma();

  server = app.listen(config.port, config.host, () => {
    logger.info(
      {
        host: config.host,
        port: config.port,
        env: config.nodeEnv,
        apiVersion: config.apiVersion,
      },
      'API server started',
    );
  });
}

function shutdown(signal: string): void {
  logger.info({ signal }, 'Received shutdown signal');

  if (!server) {
    void disconnectPrisma().finally(() => process.exit(0));
    return;
  }

  server.close((closeError) => {
    if (closeError) {
      logger.error({ err: closeError }, 'Error closing HTTP server');
      process.exit(1);
      return;
    }

    void disconnectPrisma()
      .then(() => {
        logger.info('Graceful shutdown complete');
        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error({ err: error }, 'Error during graceful shutdown');
        process.exit(1);
      });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

void bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start API server');
  process.exit(1);
});
