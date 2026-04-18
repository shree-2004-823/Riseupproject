import { z } from 'zod';

export const journalSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().min(1).max(4000),
  emotionTag: z.string().trim().max(40).optional(),
});
