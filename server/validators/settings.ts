import { z } from 'zod';

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);
const reminderSettingSchema = z.object({
  type: z.enum(['workout', 'hydration', 'mood-check', 'journal', 'quit-support', 'sleep']),
  enabled: z.boolean(),
  time: timeSchema,
});

export const settingsUpdateSchema = z
  .object({
    coachPersonality: z.string().trim().min(1).max(80).optional(),
    routine: z
      .object({
        wakeTime: timeSchema.optional(),
        sleepTime: timeSchema.optional(),
        workoutTime: timeSchema.optional(),
        reminderTime: timeSchema.optional(),
      })
      .optional(),
    reminderSettings: z.array(reminderSettingSchema).max(6).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one settings field to update',
  });
