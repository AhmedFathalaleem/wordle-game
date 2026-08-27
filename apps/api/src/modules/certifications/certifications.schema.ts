import { z } from 'zod';

import { listQueryBaseSchema } from '../../common/schemas/common.schemas.js';

export const certificationListQuerySchema = listQueryBaseSchema.extend({
  issuer: z.string().trim().optional(),
});

export const createCertificationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(200),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().nullable().optional(),
  credentialId: z.string().trim().max(200).nullable().optional(),
  credentialUrl: z.string().url().max(1000).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CertificationListQuery = z.infer<typeof certificationListQuerySchema>;
export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
