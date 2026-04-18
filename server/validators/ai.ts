import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().trim().min(1).max(100).optional(),
});

export const aiActionSchema = z.object({
  actionId: z.string().trim().min(1).max(100),
  conversationId: z.string().trim().min(1).max(100).optional(),
});
