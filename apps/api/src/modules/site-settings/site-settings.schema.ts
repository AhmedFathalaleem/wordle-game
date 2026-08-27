import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(200).optional(),
  siteDescription: z.string().trim().max(500).nullable().optional(),
  ownerName: z.string().trim().min(1).max(120).optional(),
  logoUrl: z.string().url().max(1000).nullable().optional(),
  faviconUrl: z.string().url().max(1000).nullable().optional(),
  theme: z.record(z.unknown()).optional(),
  analytics: z.record(z.unknown()).optional(),
});

export const createSiteSettingsSchema = updateSiteSettingsSchema.extend({
  siteTitle: z.string().trim().min(1).max(200),
  ownerName: z.string().trim().min(1).max(120),
});

export type CreateSiteSettingsInput = z.infer<typeof createSiteSettingsSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
