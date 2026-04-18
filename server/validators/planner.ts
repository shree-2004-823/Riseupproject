import { z } from 'zod';

export const plannerItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).optional(),
  priority: z.string().trim().max(20).optional(),
  status: z.string().trim().optional(),
  period: z.string().trim().min(1),
  energyLevel: z.string().trim().optional(),
  scheduledTime: z.string().trim().optional(),
  fallbackTask: z.string().trim().max(120).optional(),
});

export const plannerSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode: z.string().trim().optional(),
  items: z.array(plannerItemSchema),
});

export const plannerItemUpdateSchema = z.object({
  itemId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(120).optional(),
  category: z.string().trim().max(40).optional(),
  priority: z.string().trim().max(20).optional(),
  status: z.string().trim().optional(),
  period: z.string().trim().optional(),
  energyLevel: z.string().trim().optional(),
  scheduledTime: z.string().trim().optional(),
  fallbackTask: z.string().trim().max(120).optional(),
});

export const plannerItemCreateSchema = plannerItemSchema.extend({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
