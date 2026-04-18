import { z } from 'zod';

export const onboardingSchema = z.object({
  goals: z.array(z.string().trim().min(1)).min(1),
  habits: z.array(z.string().trim().min(1)).min(1),
  customHabits: z.array(z.string().trim().min(1)).default([]),
  routine: z.object({
    wakeTime: z.string().optional().default('07:00'),
    workoutTime: z.string().optional().default('08:00'),
    reminderTime: z.string().optional().default('20:00'),
    sleepTime: z.string().optional().default('22:00'),
  }),
  coachPersonality: z.string().trim().min(1),
});
