import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid resource id'),
});

export const listQueryBaseSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sort: z.string().trim().optional(),
});

export type ListQueryBase = z.infer<typeof listQueryBaseSchema>;

export type IdParam = z.infer<typeof idParamSchema>;
