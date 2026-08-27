import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .email('A valid email is required')
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const refreshBodySchema = z.object({}).strict();

export const logoutBodySchema = z.object({}).strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
