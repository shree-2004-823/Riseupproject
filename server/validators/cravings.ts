import { z } from 'zod';

export const cravingSchema = z.object({
  habitType: z.string().trim().min(1).default('smoking'),
  trigger: z.string().trim().max(80).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  outcome: z.string().trim().optional(),
  resisted: z.boolean().optional(),
  notes: z.string().trim().max(400).optional(),
});
