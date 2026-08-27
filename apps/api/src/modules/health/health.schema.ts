import { z } from 'zod';

export const healthCheckParamsSchema = z.object({}).strict();

export const livenessResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

export const readinessResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  timestamp: z.string().datetime(),
  checks: z.object({
    database: z.enum(['up', 'down']),
  }),
});

export type LivenessResponse = z.infer<typeof livenessResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
