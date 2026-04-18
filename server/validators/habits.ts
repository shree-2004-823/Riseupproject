import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1),
  frequency: z.string().trim().max(40).optional(),
  difficulty: z.string().trim().optional(),
  scheduledTime: z.string().trim().optional(),
  reminderTime: z.string().trim().optional(),
  fallbackTask: z.string().trim().max(120).optional(),
});

export const habitUpdateSchema = habitSchema.partial();
