import { z } from 'zod';

const reminderTypeSchema = z.enum(['workout', 'hydration', 'mood-check', 'journal', 'quit-support', 'sleep']);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const reminderScheduleSchema = z.object({
  type: reminderTypeSchema,
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().max(240).optional(),
  time: timeSchema,
  habitId: z.string().trim().optional(),
});

export const reminderScheduleUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().trim().min(1).max(120).optional(),
  message: z.string().trim().max(240).optional(),
  time: timeSchema.optional(),
});
