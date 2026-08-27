import { ProficiencyLevel } from '@prisma/client';
import { z } from 'zod';

import { listQueryBaseSchema } from '../../common/schemas/common.schemas.js';

export const skillListQuerySchema = listQueryBaseSchema.extend({
  skillCategoryId: z.string().uuid().optional(),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
});

export const createSkillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  skillCategoryId: z.string().uuid(),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export type SkillListQuery = z.infer<typeof skillListQuerySchema>;
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
