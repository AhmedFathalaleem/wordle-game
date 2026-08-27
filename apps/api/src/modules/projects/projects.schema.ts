import { ContentStatus } from '@prisma/client';
import { z } from 'zod';

import { listQueryBaseSchema } from '../../common/schemas/common.schemas.js';

export const projectListQuerySchema = listQueryBaseSchema.extend({
  status: z.nativeEnum(ContentStatus).optional(),
  categoryId: z.string().uuid().optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  summary: z.string().trim().max(500).optional(),
  content: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  sortOrder: z.number().int().optional(),
  featured: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  seo: z.record(z.unknown()).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  technologyIds: z.array(z.string().uuid()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
