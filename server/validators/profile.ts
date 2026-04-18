import { z } from 'zod';

export const profileUpdateSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80).optional(),
    goals: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
    coachPersonality: z.string().trim().min(1).max(80).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one profile field to update',
  });
