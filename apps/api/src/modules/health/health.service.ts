import type { LivenessResponse, ReadinessResponse } from './health.schema.js';
import type { HealthRepository } from './health.repository.js';

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    const databaseUp = await this.healthRepository.pingDatabase();

    return {
      status: databaseUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseUp ? 'up' : 'down',
      },
    };
  }
}
