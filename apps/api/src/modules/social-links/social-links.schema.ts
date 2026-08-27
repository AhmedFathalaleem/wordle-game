import { SocialPlatform } from '@prisma/client';
import { z } from 'zod';

import { listQueryBaseSchema } from '../../common/schemas/common.schemas.js';

export const socialLinkListQuerySchema = listQueryBaseSchema.extend({
  platform: z.nativeEnum(SocialPlatform).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const createSocialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().trim().url().max(1000),
  label: z.string().trim().max(100).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export type SocialLinkListQuery = z.infer<typeof socialLinkListQuerySchema>;
export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
