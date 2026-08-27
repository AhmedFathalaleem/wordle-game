import { MessageStatus } from '@prisma/client';
import { z } from 'zod';

import { listQueryBaseSchema } from '../../common/schemas/common.schemas.js';

export const messageListQuerySchema = listQueryBaseSchema.extend({
  status: z.nativeEnum(MessageStatus).optional(),
  email: z.string().trim().email().optional(),
});

export const createMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(5000),
});

export const updateMessageSchema = z.object({
  status: z.nativeEnum(MessageStatus).optional(),
  readAt: z.coerce.date().nullable().optional(),
});

export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
